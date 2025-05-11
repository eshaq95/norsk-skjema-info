
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
 * Intelligently removes Norwegian country code prefixes (+47, 0047) if present
 * Returns only the 8-digit phone number
 */
export function removeNorwegianCountryCode(phone: string): string {
  const normalized = normalisePhone(phone);
  
  // Check for 0047 prefix (handle this first since it's longer)
  if (normalized.startsWith('0047') && normalized.length >= 12) {
    return normalized.substring(4, 12);
  }
  
  // Check for 47 prefix
  if (normalized.startsWith('47') && normalized.length >= 10) {
    return normalized.substring(2, 10);
  }
  
  // Just return the first 8 digits of the normalized number
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
 * Validates if a phone number is a valid Norwegian number after normalization.
 * Automatically strips country codes and validates the remaining digits.
 */
export function isValidNorwegian(phone: string): boolean {
  const withoutCountryCode = removeNorwegianCountryCode(phone);
  
  // Phone must be exactly 8 digits after country code removal
  return withoutCountryCode.length === 8;
}

/**
 * Check if the phone has country code prefixes like +47 or 0047
 */
export function hasCountryCode(phone: string): boolean {
  const normalized = normalisePhone(phone);
  return phone.includes('+') || 
         phone.startsWith('00') || 
         (normalized.startsWith('47') && normalized.length >= 10) ||
         (normalized.startsWith('0047') && normalized.length >= 12);
}

/**
 * Formats a phone number for display with proper Norwegian spacing (XX XX XX XX)
 * Automatically handles country codes if present
 */
export function formatDisplayPhone(phone: string): string {
  const normalized = removeNorwegianCountryCode(phone);
  
  // Ensure we only format if we have numbers to work with
  if (!normalized || normalized.length === 0) return '';
  
  // Group the digits in pairs for Norwegian formatting (XX XX XX XX)
  if (normalized.length <= 2) return normalized;
  if (normalized.length <= 4) return `${normalized.substring(0, 2)} ${normalized.substring(2)}`;
  if (normalized.length <= 6) return `${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4)}`;
  
  // For 8 digits (full Norwegian number), format as XX XX XX XX
  return `${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 6)} ${normalized.substring(6, 8)}`;
}

/**
 * Formats a phone number for the 1881 API
 * For the services.api1881.no endpoint, returns just the digits without country code
 */
export function format1881PhoneNumber(phone: string): string {
  // Remove all non-digit characters and country code
  return removeNorwegianCountryCode(phone);
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
