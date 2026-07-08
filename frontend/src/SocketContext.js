import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_URL } from './config';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(API_URL);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const subscribeToStock = (symbol) => {
    if (socket) {
      socket.emit('subscribe-stock', symbol);
    }
  };

  const subscribeToIndices = () => {
    if (socket) {
      socket.emit('subscribe-indices');
    }
  };

  const value = {
    socket,
    isConnected,
    subscribeToStock,
    subscribeToIndices
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};