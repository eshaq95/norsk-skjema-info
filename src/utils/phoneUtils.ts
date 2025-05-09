
import { supabase } from "@/integrations/supabase/client";

// Phone Types
export interface PhoneOwner {
  id: string;
  name?: string;
  address?: string;
  postnr?: string;
  poststed?: string;
}

export interface PhoneLookupResult {
  content: PhoneOwner[];
  hasMore: boolean;
}

/**
 * Formats a Norwegian phone number.
 * Removes any non-digit characters and ensures the number starts with +47 if not already.
 */
export function normalisePhone(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // If the number is 8 digits and doesn't start with a country code, add +47 (Norway)
  if (normalized.length === 8 && !normalized.startsWith('47')) {
    normalized = `47${normalized}`;
  }
  
  return normalized;
}

/**
 * Validates if a phone number is a valid Norwegian number.
 * Norwegian numbers are 8 digits, and may or may not include the country code +47.
 */
export function isValidNorwegian(phone: string): boolean {
  const normalized = normalisePhone(phone);
  
  // Valid Norwegian number: either 8 digits or 10 digits starting with 47
  return (normalized.length === 8) || (normalized.length === 10 && normalized.startsWith('47'));
}

/**
 * Looks up phone number information using the 1881 API via our Supabase edge function
 */
export async function lookup1881(phone: string): Promise<PhoneLookupResult> {
  try {
    // Use the Supabase edge function to proxy the request
    const { data, error } = await supabase.functions.invoke('phone-lookup', {
      query: { number: phone }
    });
    
    if (error) {
      console.error('Error calling phone-lookup function:', error);
      throw new Error(`Failed to lookup phone number: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in lookup1881:', error);
    throw error;
  }
}
