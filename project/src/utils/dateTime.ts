export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function canTakeMedication(scheduledTime: string): boolean {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(':');
  const scheduledDate = new Date();
  scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  return now >= scheduledDate;
}

export function getTimeFromDate(date: Date): string {
  return date.toTimeString().slice(0, 5);
}