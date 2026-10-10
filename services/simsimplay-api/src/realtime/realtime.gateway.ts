import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("room:join")
  handleJoin(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.join(payload.roomId);
    this.server.to(payload.roomId).emit("event", { event: "room:joined", payload: { roomId: payload.roomId } });
  }

  @SubscribeMessage("move:submit")
  handleMove(@MessageBody() payload: { roomId: string; row: number; column: number }) {
    this.server.to(payload.roomId).emit("event", { event: "move:applied", payload });
  }
}
