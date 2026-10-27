import { Module } from '@nestjs/common';
import { OrderEventsGateway } from './order-events.gateway';

@Module({
  providers: [OrderEventsGateway],
})
export class WebsocketModule {}
