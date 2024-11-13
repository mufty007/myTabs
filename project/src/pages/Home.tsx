import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { Prescription } from '../types';
import { Calendar } from '../components/Calendar';
import PrescriptionCard from '../components/PrescriptionCard';
import { Modal } from '../components/Modal';
import AddPrescription from './AddPrescription';
import Header from '../components/Header';

interface HomeProps {
  onAddClick: () => void;
}

export default function Home({ onAddClick }: HomeProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | null>(null);
  const { requestNotificationPermission, scheduleNotifications } = useNotifications();
  const { 
    user, 
    prescriptions, 
    addOrUpdatePrescription, 
    deletePrescription, 
    markPrescriptionTaken 
  } = usePrescriptions(selectedDate);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await requestNotificationPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    };

    initializeNotifications();
  }, [requestNotificationPermission]);

  useEffect(() => {
    prescriptions.forEach(({ prescription, time }) => {
      scheduleNotifications(prescription, time);
    });
  }, [prescriptions, scheduleNotifications]);

  const handleAddPrescription = async (prescription: Prescription) => {
    const newPrescription = addOrUpdatePrescription(prescription, Boolean(prescriptionToEdit));

    prescription.times.forEach(time => {
      scheduleNotifications(newPrescription, time);
    });

    setIsModalOpen(false);
    setPrescriptionToEdit(null);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setPrescriptionToEdit(prescription);
    setIsModalOpen(true);
  };

  const handleDeletePrescription = (id: string) => {
    deletePrescription(id);
  };

  const handleMarkTaken = (prescriptionId: string, time: string) => {
    markPrescriptionTaken(prescriptionId, time);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="sticky top-0 z-20">
          <Header userName={user.name} />

          <Calendar 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        <div className="p-6 space-y-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No prescriptions for this date</p>
              <button
                onClick={onAddClick}
                className="inline-flex items-center px-4 py-2 bg-[#3B4262] text-white rounded-lg hover:bg-[#2d3249] transition-colors"
              >
                Add Prescription
              </button>
            </div>
          ) : (
            <>
              {prescriptions.map(({ prescription, time }, index) => (
                <PrescriptionCard
                  key={`${prescription.id}-${time}`}
                  prescription={prescription}
                  time={time}
                  index={index}
                  onDelete={handleDeletePrescription}
                  onEdit={handleEditPrescription}
                  onMarkTaken={handleMarkTaken}
                />
              ))}
            </>
          )}
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setPrescriptionToEdit(null);
          }}
        >
          <AddPrescription 
            onComplete={handleAddPrescription}
            initialPrescription={prescriptionToEdit}
            onClose={() => {
              setIsModalOpen(false);
              setPrescriptionToEdit(null);
            }}
            onSubmit={handleAddPrescription}
            isSubmitting={false}
          />
        </Modal>
      </div>
    </div>
  );
}