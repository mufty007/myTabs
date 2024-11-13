import { Medicine } from '../types';
import { medications } from '../data/medications';

export async function searchMedicines(query: string): Promise<Medicine[]> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  // First search in our local database
  const localResults = medications
    .filter(med => 
      med.name.toLowerCase().includes(normalizedQuery) ||
      med.category.toLowerCase().includes(normalizedQuery) ||
      med.uses.some(use => use.toLowerCase().includes(normalizedQuery))
    )
    .map(med => ({
      id: med.name.toLowerCase().replace(/\s/g, '-'),
      name: med.name,
      category: med.category,
      uses: med.uses
    }));

  if (localResults.length > 0) {
    return localResults;
  }

  // If no local results, try the RxNav API as fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.suggestionGroup?.suggestionList) {
      return data.suggestionGroup.suggestionList.map((name: string) => ({
        id: name.toLowerCase().replace(/\s/g, '-'),
        name
      }));
    }
    
    return [];
  } catch (error) {
    // If the API call fails, just return local results as fallback
    console.warn('RxNav API error, using local results:', error);
    return localResults;
  }
}