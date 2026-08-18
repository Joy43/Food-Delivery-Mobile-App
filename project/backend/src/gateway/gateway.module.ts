import { Module } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';
import { MessageGateway } from './message.gateway';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [LocationModule],
  providers: [OrdersGateway, MessageGateway],
  exports: [OrdersGateway, MessageGateway],
})
export class GatewayModule {}
