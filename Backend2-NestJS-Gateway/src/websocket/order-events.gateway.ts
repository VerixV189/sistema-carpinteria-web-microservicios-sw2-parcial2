import { Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RabbitMQService } from '../messaging/rabbitmq.service';

/**
 * WebSocket gateway — canal real-time hacia frontends.
 * Spring Boot publica order.status_changed → RabbitMQ → aquí → socket.
 */
@WebSocketGateway({ cors: { origin: '*' }, path: '/ws' })
export class OrderEventsGateway implements OnModuleInit {
  private readonly logger = new Logger(OrderEventsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly rabbit: RabbitMQService) {}

  onModuleInit(): void {
    this.rabbit.events.on('order.status_changed', (payload: unknown) => {
      this.server?.emit('order.status_changed', payload);
    });
  }
}
