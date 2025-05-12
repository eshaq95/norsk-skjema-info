import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PersonalInfoSection from './address/PersonalInfoSection';
import AddressSection from './address/AddressSection';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { stripPhoneFormatting } from '@/utils/phoneUtils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  fornavn: string;
  etternavn: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
  kommune: string;
  kommuneId: string;
  gate: string;
  gateId: string;
  husnummer: string;
  email: string;
}

interface FormErrors {
  fornavn?: string;
  etternavn?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  kommune?: string;
  gate?: string;
  husnummer?: string;
  email?: string;
}

const NorskForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fornavn: '',
    etternavn: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    kommune: '',
    kommuneId: '',
    gate: '',
    gateId: '',
    husnummer: '',
    email: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error when user starts typing again
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear the error when user starts typing again
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const saveToDatabase = async () => {
    try {
      // Strip spaces from phone number before saving to database
      const formattedPhoneNumber = stripPhoneFormatting(formData.telefon);
      
      // Generate a unique ID for guest profile
      const profileId = uuidv4();
      
      // Create customer profile
      const { data: profileData, error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
          id: profileId,
          fornavn: formData.fornavn,
          etternavn: formData.etternavn,
          telefon: formattedPhoneNumber,
          adresse: formData.adresse,
          postnummer: formData.postnummer,
          poststed: formData.poststed,
          kommune: formData.kommune,
        })
        .select();
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
      
      // Create order linked to profile
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: profileId,
          product_name: 'NordicMelatonin™',
          price: 299.00,
          status: 'pending'
        })
        .select();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }
      
      // Proceed to Chargebee payment
      if (orderData && orderData[0]) {
        return await proceedToChargebee(orderData[0].id, {
          id: profileId,
          ...formData
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error saving to database:', error);
      return false;
    }
  };

  const proceedToChargebee = async (orderId: string, profileData: any) => {
    try {
      setIsSubmitting(true);
      
      // Strip spaces from phone number before sending to Chargebee
      const formattedPhoneNumber = stripPhoneFormatting(formData.telefon);
      
      // Customer data for Chargebee
      const customer = {
        first_name: formData.fornavn,
        last_name: formData.etternavn,
        email: formData.email,
        phone: formattedPhoneNumber,
        billing_address: {
          first_name: formData.fornavn,
          last_name: formData.etternavn,
          line1: formData.adresse,
          city: formData.poststed,
          zip: formData.postnummer,
          country: "NO",
          phone: formattedPhoneNumber
        }
      };
      
      // Call Supabase edge function to create Chargebee hosted page
      const { data, error } = await supabase.functions.invoke<{ url: string }>(
        "create-chargebee-page",
        { 
          body: { 
            orderId: orderId, 
            customer: customer, 
            priceNok: 299.00 
          } 
        }
      );
      
      if (error || !data?.url) {
        console.error('Error creating Chargebee page:', error);
        toast({
          title: 'Noe gikk galt',
          description: 'Vi kunne ikke opprette betalingssiden. Vennligst prøv igjen senere.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return false;
      }
      
      // Redirect to Chargebee hosted page
      window.location.href = data.url;
      return true;
      
    } catch (error) {
      console.error('Error in payment process:', error);
      toast({
        title: 'Feil',
        description: 'Det oppstod en feil ved behandling av betalingen.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation for email field
    const validationData = {
      ...formData,
      // Add any other fields needed for validation
    };
    
    const newErrors = validateForm(validationData);
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const success = await saveToDatabase();
        
        if (!success) {
          toast({
            title: 'Noe gikk galt',
            description: 'Vi kunne ikke fullføre bestillingen din. Vennligst prøv igjen senere.',
            variant: 'destructive',
          });
        }
        // No need to reset form or show success toast here as we're redirecting to Chargebee
      } catch (error) {
        console.error('Submission error:', error);
        toast({
          title: 'Feil',
          description: 'Det oppstod en feil ved behandling av skjemaet.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border-t-4 border-t-norsk-blue">
      <CardHeader className="bg-gradient-to-r from-white to-norsk-gray/30">
        <CardTitle className="text-2xl font-bold text-norsk-blue text-center">
          Bestill NordicMelatonin™
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate>
          <PersonalInfoSection 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onInputChange={handleChange}
          />
          
          {/* Email Field with improved placeholder */}
          <div className="mb-4">
            <Label htmlFor="email" className="font-medium">
              E-post
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full ${
                errors.email ? 'ring-2 ring-destructive' : ''
              }`}
              placeholder="din.epost@example.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm font-medium text-destructive">{errors.email}</p>
            )}
          </div>
          
          <AddressSection 
            formData={formData}
            errors={errors}
            onAddressChange={handleFieldChange}
          />
          
          <SubmitButton 
            isSubmitting={isSubmitting} 
            text="Gå til betaling"
            loadingText="Forbereder betaling..."
          />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
