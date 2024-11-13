import { Medicine } from '../types';

const COMMON_MEDICINES = [
  'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Amoxicillin',
  'Lisinopril', 'Metformin', 'Omeprazole', 'Omega-3',
  'Vitamin D', 'Vitamin C', 'Zinc', 'Magnesium'
].map(name => ({ id: name.toLowerCase().replace(/\s/g, '-'), name }));

export async function searchMedicines(query: string): Promise<Medicine[]> {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    if (data?.suggestionGroup?.suggestionList) {
      return data.suggestionGroup.suggestionList.map((name: string) => ({
        id: name.toLowerCase().replace(/\s/g, '-'),
        name
      }));
    }
    
    return fallbackSearch(query);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return fallbackSearch(query);
  }
}

function fallbackSearch(query: string): Medicine[] {
  const normalizedQuery = query.toLowerCase();
  return COMMON_MEDICINES.filter(medicine => 
    medicine.name.toLowerCase().includes(normalizedQuery)
  );
}