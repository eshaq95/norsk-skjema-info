
import React from 'react';
import NorskForm from '@/components/NorskForm';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-norsk-dark">Norsk Adresseskjema</h1>
        <NorskForm />
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Norsk Skjema Info. Alle rettigheter reservert.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
