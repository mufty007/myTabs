import React from 'react';
import { Prescription } from '../types';

interface TimeSelectorProps {
  times: string[];
  onChange: (times: string[]) => void;
  frequency: Prescription['frequency'];
}

export function TimeSelector({ times, onChange, frequency }: TimeSelectorProps) {
  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    onChange(newTimes);
  };

  const addTime = () => {
    onChange([...times, '12:00']);
  };

  const removeTime = (index: number) => {
    onChange(times.filter((_, i) => i !== index));
  };

  const getTimeSlots = React.useCallback(() => {
    switch (frequency) {
      case 'every4hrs':
        return ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00'];
      case 'every8hrs':
        return ['08:00', '16:00', '00:00'];
      case 'twiceDaily':
        return ['08:00', '20:00'];
      default:
        return times;
    }
  }, [frequency, times]);

  React.useEffect(() => {
    if (frequency !== 'custom') {
      onChange(getTimeSlots());
    }
  }, [frequency, onChange, getTimeSlots]);

  if (frequency !== 'custom') {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Medication Times
        </label>
        <div className="grid grid-cols-2 gap-4">
          {getTimeSlots().map((time, index) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-lg text-center"
            >
              {time}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Custom Times
      </label>
      {times.map((time, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="time"
            value={time}
            aria-label={`Medication time ${index + 1}`}
            onChange={(e) => handleTimeChange(index, e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {times.length > 1 && (
            <button
              type="button"
              onClick={() => removeTime(index)}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addTime}
        className="w-full px-4 py-2 bg-gray-100 rounded-lg"
      >
        Add Time
      </button>
    </div>
  );
}