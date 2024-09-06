'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  // eslint-disable-next-line no-unused-vars
  sendMessage: (message: string) => any;
  messages: string[];
}

const SocketContext = createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const _socket = io('http://localhost:8000');
    setSocket(_socket);

    _socket.on('event:message', onMessageRec);

    return () => {
      _socket.disconnect();
      _socket.off('event:message', onMessageRec);
      setSocket(null);
    };
  }, []);

  const onMessageRec = useCallback((msg: string) => {
    console.log('Message received:', msg);
    const { message } = JSON.parse(msg) as { message: string };
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage: ISocketContext['sendMessage'] = useCallback(
    (message) => {
      console.log('Sending message:', message);
      if (!socket) {
        console.error('Socket is not connected');
        return;
      }

      socket.emit('event:message', { message });
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
