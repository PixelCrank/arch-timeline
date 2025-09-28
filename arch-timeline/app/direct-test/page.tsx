'use client'

import { useState } from 'react'

export default function SimpleSanityTest() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Direct fetch to Sanity API
      const response = await fetch(
        `https://9i4jo80o.api.sanity.io/v1/data/query/production?query=*[0]`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Success! Response: ${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`❌ Error: ${response.status} - ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error: any) {
      setTestResult(`❌ Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Direct Sanity API Test
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Testing direct connection to Sanity project: <code className="bg-gray-100 px-2 py-1 rounded">9i4jo80o</code>
            </p>
            
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Direct API Connection'}
            </button>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <pre className="text-sm overflow-auto">{testResult}</pre>
              </div>
            )}
            
            <div className="mt-8 space-y-2 text-sm text-gray-600">
              <p><strong>If you see a CORS error:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://sanity.io/manage" target="_blank" className="text-blue-600">sanity.io/manage</a></li>
                <li>Select your project</li>
                <li>Go to Settings → API → CORS Origins</li>
                <li>Add: <code>http://localhost:3002</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}