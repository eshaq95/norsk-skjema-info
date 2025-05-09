
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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is authenticated - save profile to their account
        const { error: profileError } = await supabase
          .from('customer_profiles')
          .upsert({
            user_id: user.id,
            fornavn: formData.fornavn,
            etternavn: formData.etternavn,
            telefon: formData.telefon,
            adresse: formData.adresse,
            postnummer: formData.postnummer,
            poststed: formData.poststed,
            kommune: formData.kommune,
          }, { 
            onConflict: 'user_id' 
          });

        if (profileError) throw profileError;

        // Create order
        const { error: orderError } = await supabase.from('orders').insert({
          product_name: 'NordicMelatonin™',
          price: 299.00,
          status: 'pending'
        });

        if (orderError) throw orderError;
      } else {
        // User is not authenticated - create guest profile
        const profileId = uuidv4();
        
        // Create customer profile
        const { error: profileError } = await supabase.from('customer_profiles').insert({
          id: profileId,
          fornavn: formData.fornavn,
          etternavn: formData.etternavn,
          telefon: formData.telefon,
          adresse: formData.adresse,
          postnummer: formData.postnummer,
          poststed: formData.poststed,
          kommune: formData.kommune,
        });
        
        if (profileError) throw profileError;
        
        // Create order linked to guest profile
        const { error: orderError } = await supabase.from('orders').insert({
          customer_id: profileId,
          product_name: 'NordicMelatonin™',
          price: 299.00,
          status: 'pending'
        });
        
        if (orderError) throw orderError;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving to database:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const success = await saveToDatabase();
        
        if (success) {
          toast({
            title: 'Bestilling mottatt!',
            description: 'Vi sender NordicMelatonin™ til deg innen 1-3 virkedager.',
          });
          
          // Reset form after successful submission
          setFormData({
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
            husnummer: ''
          });
        } else {
          toast({
            title: 'Noe gikk galt',
            description: 'Vi kunne ikke fullføre bestillingen din. Vennligst prøv igjen senere.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Submission error:', error);
        toast({
          title: 'Feil',
          description: 'Det oppstod en feil ved behandling av skjemaet.',
          variant: 'destructive',
        });
      } finally {
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
        <CardDescription className="text-center">
          Vi sender på 1-3 virkedager. Ingen bindingstid og ingen skjulte kostnader.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate>
          <PersonalInfoSection 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onInputChange={handleChange}
          />
          
          <AddressSection 
            formData={formData}
            errors={errors}
            onAddressChange={handleFieldChange}
          />
          
          <SubmitButton isSubmitting={isSubmitting} />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
