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

    // Auto-create a DIRECT conversation between driver and restaurant owner
    await this.createDriverOwnerConversation(driver.id, updatedOrder.restaurantId);

    return updatedOrder;
  }

  /**
   * Creates a DIRECT conversation between driver and restaurant owner
   * if one doesn't already exist.
   */
  private async createDriverOwnerConversation(driverId: string, restaurantId: string) {
    try {
      // Find the restaurant owner
      const [restaurant] = await this.db
        .select()
        .from(schema.restaurants)
        .where(eq(schema.restaurants.id, restaurantId));

      if (!restaurant) return;

      const ownerId = restaurant.ownerId;

      // Check if a DIRECT conversation already exists between them
      const driverConvs = await this.db
        .select({ conversationId: schema.conversationParticipant.conversationId })
        .from(schema.conversationParticipant)
        .innerJoin(
          schema.conversation,
          eq(schema.conversation.id, schema.conversationParticipant.conversationId),
        )
        .where(
          and(
            eq(schema.conversationParticipant.userId, driverId),
            eq(schema.conversation.type, 'DIRECT'),
            isNull(schema.conversationParticipant.leftAt),
          ),
        );

      const convIds = driverConvs.map((c) => c.conversationId);

      if (convIds.length > 0) {
        const [existing] = await this.db
          .select({ conversationId: schema.conversationParticipant.conversationId })
          .from(schema.conversationParticipant)
          .where(
            and(
              inArray(schema.conversationParticipant.conversationId, convIds),
              eq(schema.conversationParticipant.userId, ownerId),
              isNull(schema.conversationParticipant.leftAt),
            ),
          );

        if (existing) {
         
          return;
        }
      }

      // Create new DIRECT conversation
      const [newConv] = await this.db
        .insert(schema.conversation)
        .values({ type: 'DIRECT' })
        .returning();

      await this.db
        .insert(schema.conversationParticipant)
        .values([
          { conversationId: newConv.id, userId: driverId, isAdmin: false },
          { conversationId: newConv.id, userId: ownerId, isAdmin: false },
        ]);

      console.log(`[DriverService] Created conversation ${newConv.id} between driver ${driverId} and owner ${ownerId}`);
    } catch (err) {
      console.error('[DriverService] Failed to create driver-owner conversation:', err);
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

