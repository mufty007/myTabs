import React, { useState } from 'react';
import { Modal } from './Modal';
import { PrescriptionDetailModal } from './PrescriptionDetailModal';
import { formatTime, canTakeMedication } from '../utils/dateTime';
import { Check, Clock, AlertCircle, UtensilsCrossed } from 'lucide-react';
import type { Prescription } from '../types';

const COLORS = [
  'bg-gradient-to-br from-fuchsia-400 to-violet-500',
  'bg-gradient-to-br from-rose-400 to-fuchsia-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-emerald-400 to-cyan-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-violet-400 to-purple-500'
];

interface PrescriptionCardProps {
  prescription: Prescription;
  time: string;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (prescription: Prescription) => void;
  onMarkTaken: (prescriptionId: string, time: string) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  time,
  index,
  onDelete,
  onEdit,
  onMarkTaken
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarkingTaken, setIsMarkingTaken] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isTaken = prescription.takenTimes?.[today]?.[time]?.taken || false;
  const takenAt = prescription.takenTimes?.[today]?.[time]?.takenAt;
  const canTake = canTakeMedication(time);
  const isLate = takenAt && new Date(takenAt).getTime() > new Date(`${today}T${time}`).getTime() + 5 * 60 * 1000;

  const handleMarkTaken = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canTake || isTaken || isMarkingTaken) return;
    
    setIsMarkingTaken(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onMarkTaken(prescription.id, time);
    setIsMarkingTaken(false);
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`${COLORS[index % COLORS.length]} rounded-2xl p-4 relative overflow-hidden cursor-pointer
          transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg
          ${isTaken ? 'opacity-60' : ''}`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 font-display text-8xl font-bold tracking-wider text-white">
            TABS
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className={`text-sm ${isTaken ? 'bg-white/20' : 'bg-white/30'} rounded-full px-3 py-1 
                  backdrop-blur-sm inline-flex items-center text-white font-medium`}>
                  {formatTime(time)}
                  {isTaken && <Check className="w-4 h-4 ml-1" />}
                  {!isTaken && !canTake && <Clock className="w-4 h-4 ml-1" />}
                </p>
                {isLate && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Late
                  </span>
                )}
              </div>
              {prescription.foodRequirements?.withFood && (
                <div className="flex items-center space-x-1 text-white/80 text-sm">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>Take with food</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-4xl font-display font-bold text-white/90">{prescription.dosage}</span>
              <p className="text-sm text-white/80">TABS</p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-display font-bold text-white">{prescription.name}</h3>
            {prescription.category && (
              <p className="text-sm text-white/80">{prescription.category}</p>
            )}
          </div>

          {!isTaken && canTake && (
            <button
              onClick={handleMarkTaken}
              disabled={isMarkingTaken}
              className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl
                backdrop-blur-sm transition-all duration-200 flex items-center justify-center space-x-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingTaken ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Mark as Taken</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PrescriptionDetailModal
          prescription={prescription}
          time={time}
          onClose={() => setIsModalOpen(false)}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </Modal>
    </>
  );
};

export default PrescriptionCard;