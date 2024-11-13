import React from 'react';
import { Medicine } from '../types';

interface SuggestionsListProps {
  suggestions: Medicine[];
  onSelect: (medicine: Medicine) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onSelect,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="absolute w-full bg-white mt-1 rounded-lg border border-gray-200 p-2 shadow-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute w-full bg-white mt-1 rounded-lg border border-red-200 p-2 shadow-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <ul className="absolute w-full bg-white mt-1 rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto z-50">
      {suggestions.map((medicine) => (
        <li
          key={medicine.id}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelect(medicine)}
        >
          {medicine.name}
        </li>
      ))}
    </ul>
  );
};