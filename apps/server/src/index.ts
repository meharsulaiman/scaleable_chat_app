import 'dotenv/config';
import http from 'http';
import SocketService from './services/socket';
import { consumeMessage } from './services/kafka';

async function init() {
  consumeMessage();
  const socketService = new SocketService();

  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  socketService.initListeners();
}

init();
