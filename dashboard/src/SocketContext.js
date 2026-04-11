import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stockData, setStockData] = useState({});
  const [indicesData, setIndicesData] = useState({});

  useEffect(() => {
    const socketInstance = io('http://localhost:3002');

    socketInstance.on('connect', () => {
      console.log('Dashboard connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Dashboard disconnected from server');
      setIsConnected(false);
    });

    // Listen for stock updates
    socketInstance.on('stock-update', (data) => {
      setStockData(prev => ({
        ...prev,
        [data.symbol]: data.data
      }));
    });

    // Listen for indices updates
    socketInstance.on('indices-update', (data) => {
      setIndicesData(data);
    });

    // Listen for errors
    socketInstance.on('stock-error', (error) => {
      console.error('Stock data error:', error);
    });

    socketInstance.on('indices-error', (error) => {
      console.error('Indices data error:', error);
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
    stockData,
    indicesData,
    subscribeToStock,
    subscribeToIndices
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};