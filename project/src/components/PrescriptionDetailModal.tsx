import { useState } from 'react';
import { Pill, Clock, Calendar, UtensilsCrossed, X } from 'lucide-react';
import type { Prescription } from '../types';
import { formatTime } from '../utils/dateTime';

interface PrescriptionDetailModalProps {
  prescription: Prescription;
  time: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (prescription: Prescription) => void;
}

export function PrescriptionDetailModal({
  prescription,
  time,
  onClose,
  onDelete,
  onEdit
}: PrescriptionDetailModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    onDelete(prescription.id);
    onClose();
  };

  return (
    <div className="overflow-y-auto max-h-[80vh]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">{prescription.name}</h2>
          <button 
            onClick={onClose} 
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-gray-600">
            <Pill className="w-5 h-5" />
            <div>
              <p className="font-medium">Dosage</p>
              <p className="text-sm">{prescription.dosage} tabs per dose</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <Clock className="w-5 h-5" />
            <div>
              <p className="font-medium">Schedule</p>
              <p className="text-sm">Next dose: {time}</p>
              {prescription.times.map((t, i) => (
                <p key={i} className="text-sm">{formatTime(t)}</p>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-sm">
                {prescription.duration?.value} {prescription.duration?.unit}
              </p>
            </div>
          </div>

          {prescription.foodRequirements?.withFood && (
            <div className="flex items-center space-x-3 text-gray-600">
              <UtensilsCrossed className="w-5 h-5" />
              <div>
                <p className="font-medium">Food Requirements</p>
                <p className="text-sm">Take with food</p>
                {prescription.foodRequirements?.timeBeforeFood && (
                  <p className="text-sm">
                    {prescription.foodRequirements.timeBeforeFood} minutes before eating
                  </p>
                )}
                {prescription.foodRequirements?.timeAfterFood?.toString() && (
                  <p className="text-sm">
                    {prescription.foodRequirements.timeAfterFood} minutes after eating
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {isDeleteConfirmOpen ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete this prescription?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDelete}
                className="py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => onEdit(prescription)}
              className="py-3 bg-navy-50 text-navy-600 rounded-xl hover:bg-navy-100"
            >
              Edit
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}