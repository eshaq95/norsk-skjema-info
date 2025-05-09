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
  _fallback?: boolean;
  _message?: string;
}

/**
 * Formats a Norwegian phone number.
 * Removes any non-digit characters and ensures the number starts with +47 if not already.
 */
export function normalisePhone(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // If the number is 8 digits and doesn't start with a country code, add +47 (Norway)
  if (normalized.length === 8) {
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
 * Formats a phone number for display in the 1881 API format
 * For the services.api1881.no endpoint, removes the + sign if present
 */
export function format1881PhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let formatted = phone.replace(/\D/g, '');
  
  // If the number is 8 digits (Norwegian format without country code)
  if (formatted.length === 8) {
    return '47' + formatted; // Add country code without +
  } 
  // If it's 10 digits starting with 47 (Norwegian format with country code)
  else if (formatted.length === 10 && formatted.startsWith('47')) {
    return formatted;
  }
  // If it already has a + sign, remove it
  else if (phone.startsWith('+')) {
    return phone.substring(1);
  }
  // Otherwise just return the digits
  else {
    return formatted;
  }
}

/**
 * Looks up phone number information using the 1881 API via our Supabase edge function
 */
export async function lookup1881(phone: string): Promise<PhoneLookupResult> {
  try {
    console.log(`Looking up phone number: ${phone}`);
    
    // Format the phone number properly for the API (using E.164 without plus sign)
    const formattedNumber = format1881PhoneNumber(phone);
    
    // Use the Supabase edge function to proxy the request
    const { data, error } = await supabase.functions.invoke('phone-lookup', {
      method: 'POST',
      body: { number: formattedNumber }
    });
    
    if (error) {
      console.error('Error calling phone-lookup function:', error);
      // Return an empty result rather than throwing, to prevent UI errors
      return { content: [], hasMore: false, _fallback: true, _message: error.message };
    }
    
    if (!data) {
      console.error('No data returned from phone-lookup function');
      // Return an empty result rather than throwing
      return { content: [], hasMore: false, _fallback: true, _message: 'No data returned' };
    }
    
    console.log('Phone lookup response:', data);
    
    // Handle potential fallback response
    if (data._fallback) {
      console.log('Using fallback phone data:', data._message);
    }
    
    // Return the data even if it's a fallback response
    return data;
  } catch (error) {
    console.error('Error in lookup1881:', error);
    // Return empty result to prevent UI errors
    return { content: [], hasMore: false, _fallback: true, _message: 'Exception in lookup function' };
  }
}
