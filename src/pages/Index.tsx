
import React, { useState } from 'react';
import NorskForm from '@/components/NorskForm';

const Index: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-norsk-dark">Norsk Adresseskjema</h1>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-500 underline"
          >
            {showDebug ? 'Skjul debug' : 'Vis debug'}
          </button>
        </div>
        
        {showDebug && (
          <div className="mb-4 p-4 bg-white rounded shadow overflow-auto max-h-40">
            <p className="font-mono text-xs">Åpne nettleser-konsollen (F12) for å se API-responser</p>
          </div>
        )}
        
        <NorskForm />
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Norsk Skjema Info. Alle rettigheter reservert.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
