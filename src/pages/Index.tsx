
import React from 'react';
import NorskForm from '@/components/NorskForm';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-norsk-blue">Norsk Skjema</h1>
          <p className="text-norsk-dark mt-2">Vennligst fyll ut informasjonen nedenfor</p>
        </header>
        
        <NorskForm />
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Norsk Skjema Info. Alle rettigheter reservert.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
