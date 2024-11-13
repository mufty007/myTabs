import { useRef, useEffect } from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function Calendar({ selectedDate, onDateChange }: CalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const centerButtonRef = useRef<HTMLButtonElement>(null);

  const getDaysArray = () => {
    const daysArray = [];
    for (let i = -15; i <= 15; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      daysArray.push({
        day: days[date.getDay()],
        date: date.getDate(),
        fullDate: date,
        isSelected: isSameDay(date, selectedDate),
        isToday: isSameDay(date, new Date())
      });
    }
    return daysArray;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  useEffect(() => {
    if (centerButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = centerButtonRef.current;
      const scrollLeft = button.offsetLeft - (container.clientWidth - button.clientWidth) / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]);

  return (
    <div 
      ref={scrollRef}
      className="flex space-x-4 overflow-x-auto pb-4 px-6 scrollbar-hide -mx-2 bg-navy-800 shadow-lg"
    >
      {getDaysArray().map((day, index) => (
        <button
          key={`${day.fullDate.toISOString()}-${index}`}
          ref={day.isToday ? centerButtonRef : null}
          onClick={() => onDateChange(day.fullDate)}
          className={`flex-shrink-0 text-center transition-all font-display ${
            day.isSelected 
              ? 'bg-white text-navy-800 rounded-lg transform scale-110' 
              : 'text-white hover:bg-white/10 rounded-lg'
          } px-3 py-1`}
        >
          <p className="text-sm font-medium">{String(day.date).padStart(2, '0')}</p>
          <p className="text-xs">{day.day}</p>
        </button>
      ))}
    </div>
  );
}