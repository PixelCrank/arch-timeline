'use client'

export default function ProjectVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Verify Your Sanity Project
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Step 1: Verify Project ID
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Go to <a href="https://sanity.io/manage" target="_blank" className="underline font-medium">sanity.io/manage</a></li>
                <li>Find your "Architecture Timeline" project</li>
                <li>The URL will show your project ID: <code>sanity.io/manage/project/YOUR-PROJECT-ID</code></li>
                <li>Copy the exact project ID from the URL</li>
              </ol>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-amber-900 mb-3">
                Step 2: Check Dataset
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-amber-800">
                <li>In your project dashboard, click on "Datasets"</li>
                <li>Make sure you have a dataset called "production"</li>
                <li>If not, create one by clicking "Create dataset"</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-3">
                Step 3: Configure CORS
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li>Go to Settings → API in your Sanity project</li>
                <li>Add these CORS origins:</li>
                <li className="ml-4">
                  <code className="bg-green-200 px-2 py-1 rounded">http://localhost:3000</code><br/>
                  <code className="bg-green-200 px-2 py-1 rounded">http://localhost:3001</code><br/>
                  <code className="bg-green-200 px-2 py-1 rounded">http://localhost:3002</code>
                </li>
              </ol>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-900 mb-3">
                Current Configuration
              </h2>
              <div className="space-y-2 text-purple-800 font-mono text-sm">
                <p>Project ID: <span className="bg-purple-200 px-2 py-1 rounded">9i4jo80o</span></p>
                <p>Dataset: <span className="bg-purple-200 px-2 py-1 rounded">production</span></p>
                <p>Organization: <span className="bg-purple-200 px-2 py-1 rounded">pixelcrank</span></p>
              </div>
            </div>

            <div className="flex space-x-4">
              <a 
                href="/sanity-test" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Test Connection
              </a>
              <a 
                href="/direct-test" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Direct API Test
              </a>
              <a 
                href="https://sanity.io/manage" 
                target="_blank" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Open Sanity Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}