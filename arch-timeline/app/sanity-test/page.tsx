'use client'

import { useEffect, useState } from 'react'
import { client } from '../../sanity/client'

export default function SanityTestPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [projectInfo, setProjectInfo] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Sanity connection with config:', {
          projectId: client.config().projectId,
          dataset: client.config().dataset,
          apiVersion: client.config().apiVersion
        })
        
        // Test basic connection with more detailed error handling
        const response = await client.fetch('*[0]')
        
        setProjectInfo({
          projectId: client.config().projectId,
          dataset: client.config().dataset,
          apiVersion: client.config().apiVersion,
          testQuery: 'Success'
        })
        setStatus('connected')
      } catch (err: any) {
        console.error('Sanity connection error:', err)
        setError(`${err.message || 'Connection failed'}\n\nFull error: ${JSON.stringify(err, null, 2)}`)
        setStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🏛️ Sanity CMS Setup Test
          </h1>
          
          {status === 'loading' && (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Testing Sanity connection...</span>
            </div>
          )}
          
          {status === 'connected' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 text-xl">✅</span>
                <span className="text-lg font-semibold text-green-800">Connected successfully!</span>
              </div>
              
              {projectInfo && (
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <p><strong>Project ID:</strong> {projectInfo.projectId}</p>
                  <p><strong>Dataset:</strong> {projectInfo.dataset}</p>
                  <p><strong>Available datasets:</strong> {projectInfo.datasetsCount}</p>
                </div>
              )}
              
              <div className="space-y-3 pt-4">
                <h2 className="text-xl font-semibold">Next Steps:</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Visit <a href="/studio" className="text-blue-600 hover:underline font-medium">/studio</a> to access the content management interface</li>
                  <li>Start adding your architecture timeline content</li>
                  <li>The timeline will automatically fetch data from Sanity</li>
                </ol>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-xl">❌</span>
                <span className="text-lg font-semibold text-red-800">Connection failed</span>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700 mt-2">
                  <li>Go to <a href="https://sanity.io" target="_blank" className="underline">sanity.io</a> and create a project</li>
                  <li>Copy your Project ID</li>
                  <li>Update <code className="bg-yellow-200 px-1 rounded">.env.local</code> with your Project ID</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Timeline
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}