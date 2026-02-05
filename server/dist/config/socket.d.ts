import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
export declare const initializeSocket: (httpServer: HTTPServer) => SocketIOServer;
export declare const isUserOnline: (userId: string) => boolean;
export declare const getOnlineUsers: () => string[];
//# sourceMappingURL=socket.d.ts.map