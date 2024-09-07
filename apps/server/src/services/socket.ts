import { Server } from 'socket.io';
import Redis from 'ioredis';
import { produceMessage } from './kafka';

const REDIS_URL = process.env.REDIS_URL || '';

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

class SocketService {
  private _io: Server;
  constructor() {
    console.log('Socket service initialized');
    this._io = new Server({
      cors: {
        allowedHeaders: ['*'],
        origin: '*',
      },
    });

    sub.subscribe('MESSAGES');
  }

  public initListeners() {
    console.log('Initializing socket listeners');
    const io = this._io;
    io.on('connect', (socket) => {
      console.log('New connection', socket.id);

      socket.on('event:message', async ({ message }: { message: string }) => {
        console.log('Message received:', message);

        await pub.publish('MESSAGES', JSON.stringify({ message }));
      });
    });

    sub.on('message', async (channel, message) => {
      if (channel === 'MESSAGES') {
        io.emit('event:message', message);
        await produceMessage(message);
        console.log('Message Produce to Kafka:', message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
