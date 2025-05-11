
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Card className="w-full shadow-md border-t-4 border-t-amber-500">
          <CardHeader className="bg-gradient-to-r from-white to-norsk-gray/30 text-center">
            <CardTitle className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16 text-amber-500" />
              <span className="text-2xl font-bold text-amber-700">Bestilling avbrutt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <p className="text-lg">Du har avbrutt betalingsprosessen.</p>
              <p>Ingen belastning er gjort på ditt kort og ingen bestilling er registrert.</p>
              
              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-norsk-blue hover:bg-norsk-blue/90"
                >
                  Tilbake til bestillingsskjemaet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">© 2025 Nordics Choice AS - Et heleid selskap av Nordic Nutrition Group AS</p>
          <p>Uranienborg terrasse 9, 0351 Oslo | Tlf: +47 22 69 00 00 | E-post: hei@nordicschoice.com</p>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutCancel;
