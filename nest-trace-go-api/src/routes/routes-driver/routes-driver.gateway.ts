import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoutesService } from '../routes.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoutesDriverGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(RoutesDriverGateway.name);

  constructor(private routesService: RoutesService) {}
  @SubscribeMessage('client:new-points')
  async handleMessage(client: Socket, payload: { route_id: string }) {
    const { route_id } = payload;

    const route = await this.routesService.findOne(route_id);
    // @ts-expect-error - routes has not been defined
    const { steps }: { steps: Step[] } = route.directions.routes[0].legs[0];

    for (const step of steps) {
      const { lat, lng }: { lat: number; lng: number } = step.start_location;

      client.emit(`server:new-points/${route_id}:list`, {
        route_id,
        lat,
        lng,
      });
      client.broadcast.emit('server:new-points:list', {
        route_id,
        lat,
        lng,
      });
      await sleep(2000);
      const { lat: lat2, lng: lng2 } = step.end_location;
      client.emit(`server:new-points/${route_id}:list`, {
        route_id,
        lat: lat2,
        lng: lng2,
      });
      client.broadcast.emit('server:new-points:list', {
        route_id,
        lat,
        lng,
      });
      await sleep(2000);
    }
  }

  emitNewPoints(payload: { route_id: string; lat: number; lng: number }) {
    this.logger.log(
      `Emitting new points for route ${payload.route_id} - ${payload.lat} - ${payload.lng}`,
    );
    this.server.emit(`server:new-points/${payload.route_id}:list`, {
      route_id: payload.route_id,
      lat: payload.lat,
      lng: payload.lng,
    });
    this.server.emit('server:new-points:list', {
      route_id: payload.route_id,
      lat: payload.lat,
      lng: payload.lng,
    });
  }
}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
