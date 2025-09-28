import { useState, useEffect } from 'react'
import { client } from '../sanity/client'
import { TIMELINE_DATA_QUERY } from '../sanity/queries'

export interface SanityMacroMovement {
  _id: string
  name: string
  slug: string
  startYear: number
  endYear: number
  description?: string
  colorClass: string
  image?: string
  order?: number
}

export interface SanityChildMovement {
  _id: string
  name: string
  slug: string
  startYear: number
  endYear: number
  region: string
  traits?: string[]
  image?: string
  parentMovement?: string
  works?: SanityWork[]
  figures?: SanityFigure[]
}

export interface SanityWork {
  _id: string
  name: string
  year?: number
  location?: string
  image?: string
  parentMovement?: string
}

export interface SanityFigure {
  _id: string
  name: string
  role?: string
  timelineYear?: number
  parentMovement?: string
}

export interface TimelineData {
  macroMovements: SanityMacroMovement[]
  childMovements: SanityChildMovement[]
  works: SanityWork[]
  figures: SanityFigure[]
}

export function useTimelineData() {
  const [data, setData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching timeline data...')
      const result = await client.fetch<TimelineData>(TIMELINE_DATA_QUERY)
      console.log('✅ Raw Sanity result:', result)
      setData(result)
      setError(null)
    } catch (err) {
      console.error('❌ Error fetching timeline data:', err)
      setError('Failed to load timeline data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Convert Sanity data to the format expected by the timeline component
export function convertSanityToTimelineFormat(sanityData: TimelineData) {
  // Group child movements by parent macro movement
  const childrenByMacro = sanityData.childMovements.reduce((acc, child) => {
    const parentSlug = child.parentMovement || 'unknown'
    if (!acc[parentSlug]) acc[parentSlug] = []
    acc[parentSlug].push(child)
    return acc
  }, {} as Record<string, SanityChildMovement[]>)

  // Group works and figures by parent child movement
  const worksByChild = sanityData.works?.reduce((acc, work) => {
    const parentSlug = work.parentMovement || 'unknown'
    if (!acc[parentSlug]) acc[parentSlug] = []
    acc[parentSlug].push(work)
    return acc
  }, {} as Record<string, SanityWork[]>) || {}

  const figuresByChild = sanityData.figures?.reduce((acc, figure) => {
    const parentSlug = figure.parentMovement || 'unknown'
    if (!acc[parentSlug]) acc[parentSlug] = []
    acc[parentSlug].push(figure)
    return acc
  }, {} as Record<string, SanityFigure[]>) || {}

  // Convert macro movements
  const macros = sanityData.macroMovements.map(macro => ({
    id: macro.slug,
    name: macro.name,
    colorClass: macro.colorClass,
    start: macro.startYear,
    end: macro.endYear,
    children: (childrenByMacro[macro.slug] || []).map(child => child.slug),
    imageUrl: macro.image,
  }))

  // Convert child movements
  const children = sanityData.childMovements.map(child => {
    const childWorks = worksByChild[child.slug] || []
    const childFigures = figuresByChild[child.slug] || []
    
    return {
      id: child.slug,
      name: child.name,
      start: child.startYear,
      end: child.endYear,
      region: child.region,
      traits: child.traits || [],
      parent: child.parentMovement || 'unknown',
      imageUrl: child.image,
      subchildren: [
        ...childWorks.map(work => `${child.slug}-work-${work._id}`),
        ...childFigures.map(figure => `${child.slug}-figure-${figure._id}`)
      ],
      // Legacy format for compatibility
      works: childWorks.map(work => ({
        title: work.name,
        year: work.year ? (work.year < 0 ? `${Math.abs(work.year)} BCE` : `${work.year}`) : undefined,
        location: work.location,
        imageUrl: work.image,
      })),
      figures: childFigures.map(figure => ({
        name: figure.name,
        role: figure.role,
      })),
    }
  })

  // Convert subchildren (works and figures combined)
  const subchildren = [
    ...(sanityData.works || []).map(work => ({
      id: `${work.parentMovement}-work-${work._id}`,
      name: work.name,
      type: 'work' as const,
      year: work.year,
      location: work.location,
      imageUrl: work.image,
      parent: work.parentMovement || 'unknown',
    })),
    ...(sanityData.figures || []).map(figure => ({
      id: `${figure.parentMovement}-figure-${figure._id}`,
      name: figure.name,
      type: 'figure' as const,
      year: figure.timelineYear,
      role: figure.role,
      parent: figure.parentMovement || 'unknown',
    }))
  ]

  return { macros, children, subchildren }
}