import { useCallback } from 'react';
import { Prescription } from '../types';

export function useNotifications() {
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('🚫 Browser does not support notifications');
      return false;
    }

    try {
      console.log('Current notification permission:', Notification.permission);
      const permission = await Notification.requestPermission();
      console.log('New notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('🔴 Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const scheduleNotifications = useCallback((prescription: Prescription, time: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Notifications are not enabled');
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

    // If time has passed for today, schedule for tomorrow
    if (scheduleTime.getTime() <= Date.now()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    const timeUntilNotification = scheduleTime.getTime() - Date.now();

    // Store timeout IDs for cleanup
    const reminderTimeout = setTimeout(() => {
      try {
        new Notification('Medication Reminder', {
          body: `Time to take ${prescription.name} in 5 minutes`,
          icon: '/pill-icon.png',
          badge: '/pill-icon.png',
          tag: `${prescription.id}-reminder-${time}`,
          requireInteraction: true,
          silent: false
        });
      } catch (error) {
        console.error('Error showing reminder notification:', error);
      }
    }, timeUntilNotification - 5 * 60 * 1000);

    const mainTimeout = setTimeout(() => {
      try {
        new Notification('Time to take medication', {
          body: `Take ${prescription.dosage} ${prescription.dosage > 1 ? 'tabs' : 'tab'} of ${prescription.name}`,
          icon: '/pill-icon.png',
          badge: '/pill-icon.png',
          tag: `${prescription.id}-due-${time}`,
          requireInteraction: true,
          silent: false
        });
      } catch (error) {
        console.error('Error showing main notification:', error);
      }
    }, timeUntilNotification);

    // Return cleanup function
    return () => {
      clearTimeout(reminderTimeout);
      clearTimeout(mainTimeout);
    };
  }, []);

  return {
    requestNotificationPermission,
    scheduleNotifications
  };
}