import { SanityDocument } from 'next-sanity'

// Type definitions for Sanity data
interface SanityMacroMovement extends SanityDocument {
  name: string
  startYear: number
  endYear: number
  description: string
  color: string
  position: number
  childMovements?: SanityChildMovement[]
}

interface SanityChildMovement extends SanityDocument {
  name: string
  startYear: number
  endYear: number
  position: number
  description: string
  architecturalWorks?: SanityArchitecturalWork[]
  keyFigures?: SanityKeyFigure[]
}

interface SanityArchitecturalWork extends SanityDocument {
  name: string
  architect: string
  year: number
  location: string
  description: string
  imageUrl?: string
}

interface SanityKeyFigure extends SanityDocument {
  name: string
  birthYear: number
  deathYear?: number
  description: string
  imageUrl?: string
}

// Timeline data types (matching existing component)
export interface MacroMovement {
  id: string
  name: string
  description: string
  years: string
  startYear: number
  endYear: number
  color: string
  position: number
  children: ChildMovement[]
}

export interface ChildMovement {
  id: string
  name: string
  description: string
  years: string
  startYear: number
  endYear: number
  position: number
  subchildren: Subchild[]
}

export interface Subchild {
  id: string
  name: string
  type: 'work' | 'figure'
  description: string
  imageUrl?: string
  metadata: {
    architect?: string
    year?: number
    location?: string
    birthYear?: number
    deathYear?: number
  }
}

// Conversion functions
export function convertSanityToTimelineFormat(sanityData: SanityMacroMovement[]): MacroMovement[] {
  return sanityData.map(macro => ({
    id: macro._id,
    name: macro.name,
    description: macro.description,
    years: `${macro.startYear}-${macro.endYear}`,
    startYear: macro.startYear,
    endYear: macro.endYear,
    color: macro.color,
    position: macro.position,
    children: (macro.childMovements || []).map(child => ({
      id: child._id,
      name: child.name,
      description: child.description,
      years: `${child.startYear}-${child.endYear}`,
      startYear: child.startYear,
      endYear: child.endYear,
      position: child.position,
      subchildren: [
        ...(child.architecturalWorks || []).map(work => ({
          id: work._id,
          name: work.name,
          type: 'work' as const,
          description: work.description,
          imageUrl: work.imageUrl,
          metadata: {
            architect: work.architect,
            year: work.year,
            location: work.location
          }
        })),
        ...(child.keyFigures || []).map(figure => ({
          id: figure._id,
          name: figure.name,
          type: 'figure' as const,
          description: figure.description,
          imageUrl: figure.imageUrl,
          metadata: {
            birthYear: figure.birthYear,
            deathYear: figure.deathYear
          }
        }))
      ]
    }))
  }))
}