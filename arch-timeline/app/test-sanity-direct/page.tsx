"use client";
import { useEffect, useState } from 'react';
import { createClient } from 'next-sanity';

const client = createClient({
  projectId: "9i4jo80o",
  dataset: "production",
  apiVersion: "2025-09-22",
  useCdn: false,
});

export default function TestSanityDirect() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log('🧪 Testing Sanity fetch...');
        console.log('✅ Client created successfully');
        
        const macroMovements = await client.fetch('*[_type == "macroMovement"]');
        console.log('✅ Fetched macro movements:', macroMovements);
        
        setResult(macroMovements);
        setError(null);
      } catch (err) {
        console.error('❌ Sanity test error:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    testFetch();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sanity Direct Test</h1>
      <p className="mb-4">Found {result?.length || 0} macro movements</p>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}