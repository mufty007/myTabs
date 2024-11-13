import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Medicine } from '../types';
import { searchMedicines } from '../utils/medicineApi';

interface MedicineSearchProps {
  onSelect: (medicine: Medicine) => void;
  value?: string;
}

export function MedicineSearch({ onSelect, value }: MedicineSearchProps) {
  const [query, setQuery] = useState(value || '');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!query || query.length < 2) {
        setMedicines([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchMedicines(query);
        setMedicines(results);
        setIsOpen(true);
      } catch (error) {
        setError(`Unable to search medications: ${(error as Error).message}`);
        setMedicines([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(fetchMedicines, 300);

    // Cleanup
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine);
    setQuery(medicine.name);
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your medication"
          className="w-full p-3 pl-10 bg-gray-50 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {isOpen && medicines.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          {medicines.map((medicine) => (
            <button
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="font-medium">{medicine.name}</div>
              {medicine.category && (
                <div className="text-sm text-gray-500">{medicine.category}</div>
              )}
              {medicine.uses && medicine.uses.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  {medicine.uses.join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg p-4 text-center text-gray-500">
          Searching...
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-red-50 text-red-600 rounded-lg shadow-lg p-4 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}