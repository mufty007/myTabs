import { useCallback } from 'react';
import { Prescription } from '../types';

export function useNotifications() {
  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    // Check if notifications are supported by the browser
    if (!('Notification' in window)) {
      console.log('🚫 Browser does not support notifications');
      return false;
    }

    try {
      // Log current permission state for debugging
      console.log('Current notification permission:', Notification.permission);

      // Request permission for notifications
      const permission = await Notification.requestPermission();

      // Log new permission state after request
      console.log('New notification permission:', permission);
      
      // Return true if permission granted, false otherwise
      return permission === 'granted';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔴 Error requesting notification permission:', errorMessage);
      return false;
    }
  }, []);

  // Schedule notifications for the given prescription and time
  const scheduleNotifications = useCallback((prescription: Prescription, time: string) => {
    // Check if the browser supports notifications and if permission is granted
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Notifications are not enabled or supported');
      return;
    }

    // Parse the scheduled time (assumes time format is "HH:MM")
    const [hours, minutes] = time.split(':').map(Number);
    const scheduleTime = new Date();

    // Set the time for the notification (using current date)
    scheduleTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule it for tomorrow
    if (scheduleTime.getTime() <= Date.now()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    // Calculate the time difference until the notification should trigger
    const timeUntilNotification = scheduleTime.getTime() - Date.now();
    console.log(`Scheduling notification for ${prescription.name} in ${timeUntilNotification / 1000} seconds`);

    // Set a timeout for the 5-minute reminder notification
    const reminderTimeout = setTimeout(() => {
      try {
        new Notification('Medication Reminder', {
          body: `Time to take ${prescription.name} in 5 minutes`,
          icon: '/pill-icon.png',
          badge: '/pill-icon.png',
          tag: `${prescription.id}-reminder-${time}`,
          requireInteraction: true,
          silent: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('🔴 Error showing reminder notification:', errorMessage);
      }
    }, timeUntilNotification - 5 * 60 * 1000); // 5 minutes before the scheduled time

    // Set a timeout for the main notification
    const mainTimeout = setTimeout(() => {
      try {
        new Notification('Time to take medication', {
          body: `Take ${prescription.dosage} ${prescription.dosage > 1 ? 'tabs' : 'tab'} of ${prescription.name}`,
          icon: '/pill-icon.png',
          badge: '/pill-icon.png',
          tag: `${prescription.id}-due-${time}`,
          requireInteraction: true,
          silent: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('🔴 Error showing main notification:', errorMessage);
      }
    }, timeUntilNotification);

    // Return a cleanup function to clear timeouts if needed
    return () => {
      clearTimeout(reminderTimeout);
      clearTimeout(mainTimeout);
    };
  }, []);

  return {
    requestNotificationPermission,
    scheduleNotifications,
  };
}
