import { createClient } from 'next-sanity'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-09-22'

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Sanity config:', { projectId, dataset, apiVersion })
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for development
  perspective: 'published', // Explicitly set perspective
})