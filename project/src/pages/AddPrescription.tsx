import React, { useState, useEffect } from 'react';
import { Plus, Minus, AlertCircle, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import type { Prescription, Medicine } from '../types';
import { MedicineSearch } from '../components/MedicineSearch';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface AddPrescriptionProps {
  onComplete: (prescription: Prescription) => void;
  initialPrescription?: Prescription | null;
  onClose?: () => void;
  onSubmit: (prescription: Prescription) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddPrescription({ onComplete, initialPrescription, onClose, onSubmit, isSubmitting }: AddPrescriptionProps) {
  const [name, setName] = useState(initialPrescription?.name || '');
  const [category, setCategory] = useState(initialPrescription?.category || '');
  const [uses, setUses] = useState<string[]>(initialPrescription?.uses || []);
  const [dosage, setDosage] = useState(initialPrescription?.dosage || 1);
  const [frequency, setFrequency] = useState<'every4hrs' | 'every8hrs' | 'twiceDaily' | 'custom'>(
    initialPrescription ? 'custom' : 'every4hrs'
  );
  const [firstDoseTime, setFirstDoseTime] = useState('08:00');
  const [customFrequency, setCustomFrequency] = useState(1);
  const [duration, setDuration] = useState(initialPrescription?.duration?.value || 7);
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>(
    initialPrescription?.duration?.unit || 'days'
  );
  const [needsRefill, setNeedsRefill] = useState(initialPrescription?.needsRefill || false);
  const [withFood, setWithFood] = useState(initialPrescription?.foodRequirements?.withFood || false);
  const [timeBeforeFood, setTimeBeforeFood] = useState(initialPrescription?.foodRequirements?.timeBeforeFood || 0);
  const [timeAfterFood, setTimeAfterFood] = useState(initialPrescription?.foodRequirements?.timeAfterFood || 0);
  const [showDosageWarning, setShowDosageWarning] = useState(false);

  const MAX_DOSAGE = 4;

  useEffect(() => {
    if (initialPrescription?.times) {
      setFirstDoseTime(initialPrescription.times[0]);
      setCustomFrequency(initialPrescription.times.length);
    }
  }, [initialPrescription]);

  const handleMedicineSelect = (medicine: Medicine) => {
    setName(medicine.name);
    if (medicine.category) setCategory(medicine.category);
    if (medicine.uses) setUses(medicine.uses);
  };

  const handleDosageIncrease = () => {
    if (dosage < MAX_DOSAGE) {
      setDosage(prev => prev + 1);
      setShowDosageWarning(false);
    } else {
      setShowDosageWarning(true);
    }
  };

  const getTimes = (freq: typeof frequency, firstTime: string) => {
    const [hours, minutes] = firstTime.split(':').map(Number);
    const baseTime = new Date();
    baseTime.setHours(hours, minutes, 0, 0);

    switch (freq) {
      case 'every4hrs':
        return Array.from({ length: 4 }, (_, i) => {
          const time = new Date(baseTime);
          time.setHours(time.getHours() + (i * 4));
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        });
      case 'every8hrs':
        return Array.from({ length: 3 }, (_, i) => {
          const time = new Date(baseTime);
          time.setHours(time.getHours() + (i * 8));
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        });
      case 'twiceDaily':
        return Array.from({ length: 2 }, (_, i) => {
          const time = new Date(baseTime);
          time.setHours(time.getHours() + (i * 12));
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        });
      case 'custom':
        return Array.from({ length: customFrequency }, (_, i) => {
          const time = new Date(baseTime);
          time.setHours(time.getHours() + (i * (24 / customFrequency)));
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const prescriptionData: Prescription = {
      id: initialPrescription?.id || crypto.randomUUID(),
      name: name.trim(),
      category,
      uses,
      dosage,
      frequency,
      times: getTimes(frequency, firstDoseTime),
      duration: {
        value: duration,
        unit: durationUnit
      },
      needsRefill,
      foodRequirements: {
        withFood,
        ...(withFood && timeBeforeFood > 0 ? { timeBeforeFood } : {}),
        ...(withFood && timeAfterFood > 0 ? { timeAfterFood } : {})
      },
      createdAt: initialPrescription?.createdAt || Date.now(),
      takenTimes: initialPrescription?.takenTimes || {}
    };

    try {
      await onSubmit(prescriptionData);
      onComplete(prescriptionData);
    } catch (error) {
      console.error('Failed to submit prescription:', error);
    }
  };

  return (
    <div className="bg-white h-[80vh] flex flex-col">
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-bold flex-1 text-center">
          {initialPrescription ? 'Edit Prescription' : 'Add New Prescription'}
        </h2>
        {onClose && <div className="w-9" />}
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              What are you taking?
            </label>
            <MedicineSearch onSelect={handleMedicineSelect} value={name} />
            {category && (
              <div className="mt-2 text-sm text-gray-500">
                Category: {category}
              </div>
            )}
            {uses && uses.length > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                Uses: {uses.join(', ')}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              How many tabs are you taking at a time?
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setDosage(prev => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  aria-label="Decrease dosage"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{dosage}</span>
                <button
                  type="button"
                  onClick={handleDosageIncrease}
                  aria-label="Increase dosage"
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                  disabled={dosage >= MAX_DOSAGE}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {showDosageWarning && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Maximum dosage is {MAX_DOSAGE} tabs at a time</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              How often do you take it?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFrequency('every4hrs')}
                className={`p-3 rounded-lg ${
                  frequency === 'every4hrs'
                    ? 'bg-[#3B4262] text-white'
                    : 'bg-gray-50'
                }`}
              >
                Every 4hrs
              </button>
              <button
                type="button"
                onClick={() => setFrequency('twiceDaily')}
                className={`p-3 rounded-lg ${
                  frequency === 'twiceDaily'
                    ? 'bg-[#3B4262] text-white'
                    : 'bg-gray-50'
                }`}
              >
                Twice a day
              </button>
              <button
                type="button"
                onClick={() => setFrequency('every8hrs')}
                className={`p-3 rounded-lg ${
                  frequency === 'every8hrs'
                    ? 'bg-[#3B4262] text-white'
                    : 'bg-gray-50'
                }`}
              >
                Every 8hrs
              </button>
              <button
                type="button"
                onClick={() => setFrequency('custom')}
                className={`p-3 rounded-lg ${
                  frequency === 'custom'
                    ? 'bg-[#3B4262] text-white'
                    : 'bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="firstDoseTime" className="block text-sm text-gray-600 mb-2">
              When do you take your first dose?
            </label>
            <input
              id="firstDoseTime"
              type="time"
              value={firstDoseTime}
              onChange={(e) => setFirstDoseTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            />
            {frequency !== 'custom' && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Other doses will be taken at:</p>
                {getTimes(frequency, firstDoseTime).slice(1).map((time, index) => (
                  <div key={index} className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          {frequency === 'custom' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">I need to take this medication</p>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  aria-label="Decrease frequency"
                  onClick={() => setCustomFrequency(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{customFrequency}</span>
                <button
                  type="button"
                  aria-label="Increase frequency"
                  onClick={() => setCustomFrequency(prev => prev + 1)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">times per day</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Doses will be taken at:</p>
                {getTimes(frequency, firstDoseTime).map((time, index) => (
                  <div key={index} className="text-sm text-gray-500 bg-white p-2 rounded-lg">
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              How long do you need to take it?
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center flex-1 gap-2">
                <button
                  type="button"
                  aria-label="Decrease duration"
                  onClick={() => setDuration(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{duration}</span>
                <button
                  type="button"
                  aria-label="Increase duration"
                  onClick={() => setDuration(prev => prev + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as typeof durationUnit)}
                className="flex-1 p-3 bg-gray-50 rounded-lg"
                aria-label="Duration unit"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-gray-600">
              Food Requirements
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="withFood"
                checked={withFood}
                onChange={(e) => setWithFood(e.target.checked)}
                className="w-5 h-5 rounded text-[#3B4262]"
              />
              <label htmlFor="withFood" className="text-sm text-gray-600 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Take with food
              </label>
            </div>

            {withFood && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Time before eating (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeBeforeFood}
                    onChange={(e) => setTimeBeforeFood(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-white rounded-lg"
                    min="0"
                    step="5"
                    aria-label="Time before eating in minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Time after eating (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeAfterFood}
                    onChange={(e) => setTimeAfterFood(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-white rounded-lg"
                    min="0"
                    step="5"
                    aria-label="Time after eating in minutes"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="refill"
              checked={needsRefill}
              onChange={(e) => setNeedsRefill(e.target.checked)}
              className="w-5 h-5 rounded text-[#3B4262]"
            />
            <label htmlFor="refill" className="text-sm text-gray-600">
              I will need a refill after this period
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 bg-white border-t mt-auto">
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-[#3B4262] text-white py-3 rounded-lg
              flex items-center justify-center space-x-2 disabled:opacity-50
              disabled:cursor-not-allowed hover:bg-[#2d3249] transition-all
              duration-200 active:scale-95"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" color="light" />
            ) : (
              <>
                <span>{initialPrescription ? 'Save Changes' : 'Add New Prescription'}</span>
                <Plus className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}