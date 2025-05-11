
import React, { useState } from 'react';
import NorskForm from '@/components/NorskForm';

const Index: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div className="min-h-screen bg-norsk-gray py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-500 underline mt-4"
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
      </div>
    </div>
  );
};

export default Index;
