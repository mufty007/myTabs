import { Prescription } from '../types';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function scheduleNotification(prescription: Prescription, time: string, type: 'reminder' | 'due' | 'late') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const scheduleTime = new Date();
  scheduleTime.setHours(hours, minutes, 0, 0);

  let notificationTime = new Date(scheduleTime);
  let title = '';
  let body = '';
  let tag = '';

  switch (type) {
    case 'reminder':
      notificationTime.setMinutes(notificationTime.getMinutes() - 5);
      title = 'Medication Reminder';
      body = `Time to take ${prescription.name} in 5 minutes`;
      tag = `${prescription.id}-reminder-${time}`;
      break;
    case 'due':
      title = 'Medication Due';
      body = `Time to take ${prescription.dosage} ${prescription.dosage > 1 ? 'tabs' : 'tab'} of ${prescription.name}`;
      tag = `${prescription.id}-due-${time}`;
      break;
    case 'late':
      notificationTime.setMinutes(notificationTime.getMinutes() + 5);
      title = 'Missed Medication';
      body = `Don't forget to take your ${prescription.name}`;
      tag = `${prescription.id}-late-${time}`;
      break;
  }

  const timeUntilNotification = notificationTime.getTime() - Date.now();
  if (timeUntilNotification <= 0) return;

  setTimeout(() => {
    const notification = new Notification(title, {
      body,
      tag,
      icon: '/pill-icon.png',
      badge: '/pill-icon.png',
      renotify: true,
      requireInteraction: type === 'due',
      actions: type === 'due' ? [
        { action: 'take', title: 'Mark as Taken' },
        { action: 'dismiss', title: 'Dismiss' }
      ] : undefined
    });

    notification.onclick = async (event) => {
      if (event instanceof NotificationEvent && event.action === 'take') {
        // Handle marking as taken
        window.dispatchEvent(new CustomEvent('medicationTaken', {
          detail: { prescriptionId: prescription.id, time }
        }));
      }
      notification.close();
    };
  }, timeUntilNotification);
}