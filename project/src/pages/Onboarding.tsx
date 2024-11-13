import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Prescription } from '../types';
import { Pill, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import AddPrescription from './AddPrescription';

type Step = 'name' | 'prescription';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setUser] = useLocalStorage<User | null>('user', null);
  const [, setHasCompletedOnboarding] = useLocalStorage('onboarding_complete', false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    const newUser = {
      name: name.trim(),
      prescriptions: [],
      createdAt: Date.now()
    };
    
    try {
      await setUser(newUser);
      setStep('prescription');
    } catch (error) {
      console.error('Error setting up user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrescriptionSubmit = async (prescription: Prescription) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const newPrescription = {
        ...prescription,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };

      const updatedUser = {
        name,
        prescriptions: [newPrescription],
        createdAt: Date.now()
      };

      // Batch the updates
      await Promise.all([
        setUser(updatedUser),
        setHasCompletedOnboarding(true)
      ]);

      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Error completing setup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-navy-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Name form UI */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 text-white text-3xl font-display mb-4">
              <span>my</span>
              <Pill className="w-10 h-10 rotate-45" />
              <span>TABS</span>
            </div>
            <p className="text-navy-200">Your personal medication tracker</p>
          </div>

          <form onSubmit={handleNameSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            {/* Name input form content */}
            <div>
              <label htmlFor="name" className="block text-lg font-display text-navy-800 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:ring-2 focus:ring-navy-600 focus:border-transparent text-lg"
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full bg-navy-800 text-white py-4 rounded-xl disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-navy-700 transition-all duration-200
                       active:scale-95 flex items-center justify-center space-x-3 text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="light" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                <span>NEXT</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="bg-navy-800 p-6">
          <button
            onClick={() => setStep('name')}
            className="text-white flex items-center space-x-2 mb-4 hover:bg-white/10 p-2 rounded-lg -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-white">
            <h2 className="text-2xl font-display mb-2">Add Your First Prescription</h2>
            <p className="text-navy-200">Enter the details of your medication below</p>
          </div>
        </div>
        
        <AddPrescription 
          onSubmit={handlePrescriptionSubmit} 
          isSubmitting={isSubmitting}
          onComplete={() => {}}
        />
      </div>
    </div>
  );
} 