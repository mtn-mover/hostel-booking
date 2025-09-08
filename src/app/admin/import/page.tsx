'use client';

import { useState } from 'react';

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/import-apartments', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Apartment Import Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Import Airbnb Apartments</h2>
          <p className="text-gray-600 mb-6">
            This will import all 4 configured Airbnb apartments and sync their availability calendars.
          </p>

          <button
            onClick={handleImport}
            disabled={importing}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              importing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {importing ? 'Importing...' : 'Start Import'}
          </button>
        </div>

        {importing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Importing apartments and syncing calendars...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Import Successful!
            </h3>
            <p className="text-green-700 mb-4">{result.message}</p>
            
            {result.apartments && (
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Imported Apartments:</h4>
                <ul className="space-y-2">
                  {result.apartments.map((apt: any) => (
                    <li key={apt.id} className="text-green-700">
                      • {apt.title} (ID: {apt.id})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              ❌ Import Failed
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-gray-800 mb-2">Configured Apartments:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Apartment 24131251</li>
            <li>• Apartment 19632116</li>
            <li>• Apartment 20281126</li>
            <li>• Apartment 1006983308851279367</li>
          </ul>
        </div>
      </div>
    </div>
  );
}