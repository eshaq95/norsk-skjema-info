
/**
 * Norwegian phone number utilities
 */

/**
 * Normalizes a phone number to an 8-digit Norwegian subscriber number
 * Strips non-digits and removes country code if present
 */
export const normalisePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');           // strip non-digits
  if (digits.startsWith('0047')) return digits.slice(4);
  if (digits.startsWith('47') && digits.length === 10) return digits.slice(2);
  if (digits.startsWith('00')) return '';          // foreign => invalid for lookup
  return digits;
};

/**
 * Validates if the number follows Norwegian numbering plan rules
 * Mobile: 4xxxxxxx or 9xxxxxxx
 * Landline: 2, 3, 5, 6, 7xxxxxxx
 */
export const isValidNorwegian = (num: string): boolean => {
  return /^[2345679]\d{7}$/.test(num);
};

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheEntry {
  timestamp: number;
  data: PhoneLookupResult;
}

export interface PhoneLookupResult {
  content: PhoneOwner[];
  // Other fields from API response
}

export interface PhoneOwner {
  name?: string;
  address?: string;
  postnr?: string;
  poststed?: string;
}

/**
 * Looks up a phone number in the 1881 directory
 */
export const lookup1881 = async (num: string): Promise<PhoneLookupResult | null> => {
  if (!isValidNorwegian(num)) return null;
  
  // Check cache first
  const cacheKey = `1881_${num}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();
      
      // Return cached result if it's still valid
      if (now - entry.timestamp < CACHE_TTL) {
        return entry.data;
      }
    } catch (e) {
      // Invalid cache entry, continue to fetch
      console.error("Error parsing cached 1881 data:", e);
    }
  }
  
  try {
    // Fetch from 1881 API with correct endpoint
    const res = await fetch(
      `https://app.1881.no/api/1/phone?number=${num}&size=1`,
      { headers: { Accept: 'application/json' } }
    );
    
    if (!res.ok) {
      throw new Error(`1881 lookup failed: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Store in cache with timestamp
    const cacheEntry: CacheEntry = {
      timestamp: Date.now(),
      data
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    return data;
  } catch (error) {
    console.error("Error looking up phone number:", error);
    return null;
  }
};
