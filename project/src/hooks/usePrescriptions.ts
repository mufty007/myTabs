import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { User, Prescription } from '../types';

export function usePrescriptions(selectedDate: Date) {
  const [user, setUser] = useLocalStorage<User>('user', {
    name: '',
    prescriptions: [],
    createdAt: Date.now()
  });
  const [prescriptions, setPrescriptions] = useState<Array<{prescription: Prescription; time: string}>>([]);

  const getPrescriptionsForDate = useCallback((date: Date, prescriptionsList: Prescription[]) => {
    return prescriptionsList.filter(prescription => {
      if (!prescription.duration) return true;
      
      const prescriptionStart = new Date(prescription.createdAt);
      prescriptionStart.setHours(0, 0, 0, 0);
      const selectedDateStart = new Date(date);
      selectedDateStart.setHours(0, 0, 0, 0);
      const endDate = new Date(prescriptionStart);
      
      switch (prescription.duration.unit) {
        case 'days':
          endDate.setDate(prescriptionStart.getDate() + prescription.duration.value);
          break;
        case 'weeks':
          endDate.setDate(prescriptionStart.getDate() + (prescription.duration.value * 7));
          break;
        case 'months':
          endDate.setMonth(prescriptionStart.getMonth() + prescription.duration.value);
          break;
      }
      
      return selectedDateStart >= prescriptionStart && selectedDateStart <= endDate;
    }).flatMap(prescription => 
      prescription.times.map(time => ({
        prescription,
        time
      }))
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, []);

  // Update prescriptions whenever user or selectedDate changes
  useEffect(() => {
    setPrescriptions(getPrescriptionsForDate(selectedDate, user.prescriptions));
  }, [user.prescriptions, selectedDate, getPrescriptionsForDate]);

  const addOrUpdatePrescription = useCallback((prescription: Prescription, isEdit = false) => {
    const newPrescription = {
      ...prescription,
      id: isEdit ? prescription.id : crypto.randomUUID(),
      createdAt: isEdit ? prescription.createdAt : Date.now()
    };

    const updatedPrescriptions = isEdit
      ? user.prescriptions.map(p => p.id === prescription.id ? newPrescription : p)
      : [...user.prescriptions, newPrescription];

    const updatedUser = {
      ...user,
      prescriptions: updatedPrescriptions
    };

    setUser(updatedUser);
    setPrescriptions(getPrescriptionsForDate(selectedDate, updatedPrescriptions));
    return newPrescription;
  }, [user, setUser, selectedDate, getPrescriptionsForDate]);

  const deletePrescription = useCallback((prescriptionId: string) => {
    const updatedPrescriptions = user.prescriptions.filter(p => p.id !== prescriptionId);
    
    const updatedUser = {
      ...user,
      prescriptions: updatedPrescriptions
    };

    setUser(updatedUser);
    setPrescriptions(getPrescriptionsForDate(selectedDate, updatedPrescriptions));
  }, [user, setUser, selectedDate, getPrescriptionsForDate]);

  const markPrescriptionTaken = useCallback((prescriptionId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedPrescriptions = user.prescriptions.map(p => {
      if (p.id !== prescriptionId) return p;
      return {
        ...p,
        takenTimes: {
          ...p.takenTimes,
          [today]: {
            ...p.takenTimes?.[today],
            [time]: {
              taken: true,
              takenAt: Date.now()
            }
          }
        }
      };
    });

    const updatedUser = {
      ...user,
      prescriptions: updatedPrescriptions
    };

    setUser(updatedUser);
    setPrescriptions(getPrescriptionsForDate(selectedDate, updatedPrescriptions));
  }, [user, setUser, selectedDate, getPrescriptionsForDate]);

  return {
    user,
    prescriptions,
    addOrUpdatePrescription,
    deletePrescription,
    markPrescriptionTaken
  };
}