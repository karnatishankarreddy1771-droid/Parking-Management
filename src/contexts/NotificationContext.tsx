import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  sendUserNotif: (title: string, message: string, type?: NotificationItem['type']) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = notificationService.listenToUserNotifications(
      userProfile.uid,
      (items) => {
        setNotifications(items);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const sendUserNotif = async (title: string, message: string, type: NotificationItem['type'] = 'System') => {
    if (userProfile?.uid) {
      await notificationService.sendNotification({
        userId: userProfile.uid,
        title,
        message,
        type
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, sendUserNotif }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
