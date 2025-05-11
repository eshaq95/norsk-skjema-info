
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order');
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID not found in URL');
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer_profiles(*)')
        .eq('id', orderId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!orderId,
  });
  
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Feil ved henting av ordre',
        description: 'Vi kunne ikke finne din ordre. Vennligst kontakt kundeservice.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Card className="w-full shadow-md border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-white to-norsk-gray/30 text-center">
            <CardTitle className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <span className="text-2xl font-bold text-green-700">Takk for din bestilling!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Laster inn ordredetaljer...</div>
            ) : order ? (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-lg">Din betaling er mottatt og bestillingen er bekreftet.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Ordredetaljer:</h3>
                  <p><span className="font-medium">Ordrenummer:</span> {order.id.substring(0, 8).toUpperCase()}</p>
                  <p><span className="font-medium">Produkt:</span> {order.product_name}</p>
                  <p><span className="font-medium">Beløp:</span> NOK {order.price},-</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Betalt</span></p>
                </div>
                
                {order.customer_profiles && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2">Leveringsadresse:</h3>
                    <p>{order.customer_profiles.fornavn} {order.customer_profiles.etternavn}</p>
                    <p>{order.customer_profiles.adresse}</p>
                    <p>{order.customer_profiles.postnummer} {order.customer_profiles.poststed}</p>
                  </div>
                )}
                
                <div className="text-center pt-4">
                  <p>En bekreftelse på bestillingen er sendt til din e-postadresse.</p>
                  <p className="mt-4">
                    <a href="/" className="text-norsk-blue hover:underline">
                      Tilbake til forsiden
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                Kunne ikke hente ordredetaljer. Vennligst kontakt kundeservice.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
