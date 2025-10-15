"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const StacksWalletContext = createContext();

export const useStacksWallet = () => {
  const context = useContext(StacksWalletContext);
  if (!context) {
    throw new Error('useStacksWallet must be used within a StacksWalletProvider');
  }
  return context;
};

export const StacksWalletProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Stacks session
  useEffect(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const session = new UserSession({ appConfig });
    setUserSession(session);

    // Check if user is already signed in
    if (session.isUserSignedIn()) {
      const userData = session.loadUserData();
      setUserData(userData);
      setIsConnected(true);
      setAddress(userData.profile.stxAddress.mainnet);
    }
  }, []);

  const connectWallet = async (walletType = 'leather') => {
    if (!userSession) return;

    setIsLoading(true);
    try {
      await showConnect({
        appDetails: {
          name: 'APT Casino',
          icon: '/favicon.ico',
        },
        redirectTo: '/',
        onFinish: () => {
          const userData = userSession.loadUserData();
          setUserData(userData);
          setIsConnected(true);
          setAddress(userData.profile.stxAddress.mainnet);
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (userSession) {
      userSession.signUserOut();
      setUserData(null);
      setIsConnected(false);
      setAddress(null);
      setBalance(0);
    }
  };

  const getBalance = async () => {
    if (!address) return 0;
    
    try {
      // Stacks mainnet API endpoint
      const response = await fetch(`https://api.stacks.co/extended/v1/address/${address}/balances`);
      const data = await response.json();
      const stxBalance = parseInt(data.stx.balance) / 1000000; // Convert microSTX to STX
      setBalance(stxBalance);
      return stxBalance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return 0;
    }
  };

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      getBalance();
    }
  }, [address]);

  const value = {
    userSession,
    userData,
    isConnected,
    address,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    getBalance,
  };

  return (
    <StacksWalletContext.Provider value={value}>
      {children}
    </StacksWalletContext.Provider>
  );
};