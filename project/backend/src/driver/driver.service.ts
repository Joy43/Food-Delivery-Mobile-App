import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { UserRole } from '@food-delivery/types';
import { OrdersGateway } from '../gateway/orders.gateway';

@Injectable()
export class DriverService {
  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private ordersGateway: OrdersGateway,
  ) {}

  async toggleOnline(driverId: string) {
    const [driver] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, driverId));

    if (!driver) throw new NotFoundException('Driver not found');

    const currentStatus = driver.isOnline ?? false;

    const [updated] = await this.db
      .update(schema.users)
      .set({ isOnline: !currentStatus, updatedAt: new Date() })
      .where(eq(schema.users.id, driverId))
      .returning();

    return { isOnline: updated?.isOnline ?? false };
  }

  async getStatus(driverId: string) {
    const [driver] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, driverId));

    if (!driver) throw new NotFoundException('Driver not found');
    return { isOnline: driver.isOnline ?? false };
  }

  async assignDriver(orderId: string) {
    const [driver] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.role, UserRole.DRIVER),
          eq(schema.users.isOnline, true),
        ),
      );

    if (!driver) {
      console.log('No online drivers available for order:', orderId);
      return null; // order stays READY, no driverId
    }

    const [updatedOrder] = await this.db
      .update(schema.orders)
      .set({ driverId: driver.id, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId))
      .returning();

    // push to driver:<driverId> room — driver app shows incoming order modal
    this.ordersGateway.emitDriverAssigned(driver.id, updatedOrder);

    return updatedOrder;
  }

  async acceptOrder(orderId: string, driverId: string) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId));

    if (!order) throw new NotFoundException('Order not found');
    if (order.driverId !== driverId) {
      throw new NotFoundException('Order not assigned to you');
    }

    const [updatedOrder] = await this.db
      .update(schema.orders)
      .set({ status: 'READY', updatedAt: new Date() }) // or keep it as is, or PICKED_UP based on flow
      .where(eq(schema.orders.id, orderId))
      .returning();

    // Auto-create conversations
    await this.createConversationBetween(driverId, order.customerId);
    
    // Find restaurant owner
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, order.restaurantId));
    if (restaurant) {
      await this.createConversationBetween(driverId, restaurant.ownerId);
    }

    this.ordersGateway.emitOrderUpdate(updatedOrder);
    return updatedOrder;
  }

  private async createConversationBetween(user1Id: string, user2Id: string) {
    try {
      if (user1Id === user2Id) return; // Prevent self-conversation

      const existingConvs = await this.db
        .select({ conversationId: schema.conversationParticipant.conversationId })
        .from(schema.conversationParticipant)
        .innerJoin(
          schema.conversation,
          eq(schema.conversation.id, schema.conversationParticipant.conversationId),
        )
        .where(
          and(
            eq(schema.conversationParticipant.userId, user1Id),
            eq(schema.conversation.type, 'DIRECT'),
            isNull(schema.conversationParticipant.leftAt),
          ),
        );

      const convIds = existingConvs.map((c) => c.conversationId);

      if (convIds.length > 0) {
        const [existing] = await this.db
          .select({ conversationId: schema.conversationParticipant.conversationId })
          .from(schema.conversationParticipant)
          .where(
            and(
              inArray(schema.conversationParticipant.conversationId, convIds),
              eq(schema.conversationParticipant.userId, user2Id),
              isNull(schema.conversationParticipant.leftAt),
            ),
          );

        if (existing) return; // Already exists
      }

      // Create new DIRECT conversation
      const [newConv] = await this.db
        .insert(schema.conversation)
        .values({ type: 'DIRECT' })
        .returning();

      await this.db
        .insert(schema.conversationParticipant)
        .values([
          { conversationId: newConv.id, userId: user1Id, isAdmin: false },
          { conversationId: newConv.id, userId: user2Id, isAdmin: false },
        ]);

      console.log(`[DriverService] Created conversation ${newConv.id} between ${user1Id} and ${user2Id}`);
    } catch (err) {
      console.error('[DriverService] Failed to create direct conversation:', err);
    }
  }

  async declineOrder(orderId: string, driverId: string) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId));

    if (!order) throw new NotFoundException('Order not found');
    if (order.driverId !== driverId) {
      throw new NotFoundException('Order not found');
    }

    // clear assignment
    await this.db
      .update(schema.orders)
      .set({ driverId: null, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId));

    // try to find another online driver
    await this.assignDriver(orderId);

    return { message: 'Order declined' };
  }
}

