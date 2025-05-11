
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
 * Removes any non-digit characters.
 */
export function normalisePhone(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

/**
 * Removes Norwegian country code prefixes (+47, 0047) if present
 * Returns only the 8-digit phone number
 */
export function removeNorwegianCountryCode(phone: string): string {
  const normalized = normalisePhone(phone);
  
  // Remove +47 or 0047 prefix
  if (normalized.startsWith('47') && normalized.length > 8) {
    return normalized.substring(2);
  }
  
  // Just return the 8 digits (or less if not complete)
  return normalized.slice(0, 8);
}

/**
 * Removes all spaces and formatting characters from phone number
 * Used for preparing phone number to be sent to the database
 */
export function stripPhoneFormatting(phone: string): string {
  return phone.replace(/\s/g, '');
}

/**
 * Validates if a phone number is a valid Norwegian number.
 * Norwegian numbers must be exactly 8 digits with no country code.
 */
export function isValidNorwegian(phone: string): boolean {
  const normalized = normalisePhone(phone);
  
  // Phone must be exactly 8 digits
  return normalized.length === 8;
}

/**
 * Check if the phone has country code prefixes like +47 or 0047
 */
export function hasCountryCode(phone: string): boolean {
  return phone.includes('+') || 
         phone.startsWith('00') || 
         (normalisePhone(phone).length > 8);
}

/**
 * Formats a phone number for display with proper Norwegian spacing (XX XX XX XX)
 */
export function formatDisplayPhone(phone: string): string {
  const normalized = removeNorwegianCountryCode(phone);
  
  if (normalized.length <= 2) return normalized;
  if (normalized.length <= 4) return `${normalized.substring(0, 2)} ${normalized.substring(2)}`;
  if (normalized.length <= 6) return `${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4)}`;
  
  return `${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 6)} ${normalized.substring(6, 8)}`;
}

/**
 * Formats a phone number for the 1881 API
 * For the services.api1881.no endpoint, returns just the digits without country code
 */
export function format1881PhoneNumber(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

/**
 * Looks up phone number information using the 1881 API via our Supabase edge function
 */
export async function lookup1881(phone: string): Promise<PhoneLookupResult> {
  try {
    console.log(`Looking up phone number: ${phone}`);
    
    // Format the phone number but don't add 47 prefix
    const formattedNumber = format1881PhoneNumber(phone);
    
    // Use the Supabase edge function to proxy the request
    const { data, error } = await supabase.functions.invoke('phone-lookup', {
      method: 'POST',
      body: { number: formattedNumber }
    });
    
    if (error) {
      console.log('Error calling phone-lookup function:', error);
      // Return an empty result rather than throwing, to prevent UI errors
      return { content: [], hasMore: false, _fallback: true, _message: error.message };
    }
    
    if (!data) {
      console.log('No data returned from phone-lookup function');
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
