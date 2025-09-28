'use client'

import { useEffect, useState } from 'react'
import { client } from '../../sanity/client'

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function test() {
      try {
        console.log('Testing simple Sanity query...')
        const data = await client.fetch('*[_type == "macroMovement"][0]')
        console.log('Simple query result:', data)
        setResult(data)
      } catch (err) {
        console.error('Simple query error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    test()
  }, [])

  if (loading) return <div className="p-4">Loading debug...</div>
  
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Sanity Debug</h1>
      {error && (
        <div className="bg-red-100 p-4 text-red-800">
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
      {result && (
        <div className="bg-green-100 p-4">
          <h2>Success:</h2>
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}