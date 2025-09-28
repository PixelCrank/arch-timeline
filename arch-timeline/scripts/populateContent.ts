import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { sampleMacroMovements, sampleChildMovements, sampleArchitecturalWorks, sampleKeyFigures } from '../lib/sampleData'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Note: You'll need to set SANITY_API_TOKEN in your .env.local for write access
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_TOKEN, // Only needed for write operations
  useCdn: false // Disable CDN for fresh data
})

async function createSlugDocument(slug: string) {
  return {
    _type: 'slug',
    current: slug
  }
}

async function populateContent() {
  try {
    console.log('🚀 Starting content population...')

    // First, create macro movements
    console.log('📁 Creating macro movements...')
    const macroMovementIds: Record<string, string> = {}
    
    for (const macro of sampleMacroMovements) {
      const doc = await client.create({
        _type: 'macroMovement',
        name: macro.name,
        slug: await createSlugDocument(macro.slug),
        startYear: macro.startYear,
        endYear: macro.endYear,
        description: macro.description,
        colorClass: macro.colorClass,
        order: macro.order,
        children: [] // Will be populated later
      })
      macroMovementIds[macro.slug] = doc._id
      console.log(`  ✅ Created: ${macro.name}`)
    }

    // Create child movements
    console.log('📂 Creating child movements...')
    const childMovementIds: Record<string, string> = {}
    
    for (const child of sampleChildMovements) {
      const parentId = macroMovementIds[child.parentMovement]
      if (!parentId) {
        console.warn(`  ⚠️  Parent not found for ${child.name}`)
        continue
      }

      const doc = await client.create({
        _type: 'childMovement',
        name: child.name,
        slug: await createSlugDocument(child.slug),
        startYear: child.startYear,
        endYear: child.endYear,
        region: child.region,
        description: child.description,
        traits: child.traits,
        parentMovement: {
          _type: 'reference',
          _ref: parentId
        },
        works: [], // Will be populated later
        figures: [] // Will be populated later
      })
      childMovementIds[child.slug] = doc._id
      console.log(`  ✅ Created: ${child.name}`)
    }

    // Create architectural works
    console.log('🏛️ Creating architectural works...')
    const workIds: Record<string, string> = {}
    
    for (const work of sampleArchitecturalWorks) {
      const parentId = childMovementIds[work.parentMovement]
      if (!parentId) {
        console.warn(`  ⚠️  Parent not found for ${work.name}`)
        continue
      }

      const doc = await client.create({
        _type: 'architecturalWork',
        name: work.name,
        slug: await createSlugDocument(work.slug),
        year: work.year,
        location: work.location,
        description: work.description,
        architect: work.architect,
        parentMovement: {
          _type: 'reference',
          _ref: parentId
        }
      })
      workIds[work.slug] = doc._id
      console.log(`  ✅ Created: ${work.name}`)
    }

    // Create key figures
    console.log('👤 Creating key figures...')
    const figureIds: Record<string, string> = {}
    
    for (const figure of sampleKeyFigures) {
      const parentId = childMovementIds[figure.parentMovement]
      if (!parentId) {
        console.warn(`  ⚠️  Parent not found for ${figure.name}`)
        continue
      }

      const doc = await client.create({
        _type: 'keyFigure',
        name: figure.name,
        slug: await createSlugDocument(figure.slug),
        birthYear: figure.birthYear,
        deathYear: figure.deathYear,
        role: figure.role,
        description: figure.description,
        parentMovement: {
          _type: 'reference',
          _ref: parentId
        }
      })
      figureIds[figure.slug] = doc._id
      console.log(`  ✅ Created: ${figure.name}`)
    }

    // Update child movements with their works and figures
    console.log('🔗 Linking works and figures to child movements...')
    for (const child of sampleChildMovements) {
      const childId = childMovementIds[child.slug]
      if (!childId) continue

      const relatedWorks = sampleArchitecturalWorks
        .filter(work => work.parentMovement === child.slug)
        .map(work => ({
          _type: 'reference',
          _ref: workIds[work.slug],
          _key: work.slug
        }))
        .filter(ref => ref._ref)

      const relatedFigures = sampleKeyFigures
        .filter(figure => figure.parentMovement === child.slug)
        .map(figure => ({
          _type: 'reference',
          _ref: figureIds[figure.slug],
          _key: figure.slug
        }))
        .filter(ref => ref._ref)

      if (relatedWorks.length > 0 || relatedFigures.length > 0) {
        await client
          .patch(childId)
          .set({
            works: relatedWorks,
            figures: relatedFigures
          })
          .commit()
        console.log(`  🔗 Updated ${child.name} with ${relatedWorks.length} works and ${relatedFigures.length} figures`)
      }
    }

    // Update macro movements with their children
    console.log('🔗 Linking child movements to macro movements...')
    for (const macro of sampleMacroMovements) {
      const macroId = macroMovementIds[macro.slug]
      if (!macroId) continue

      const relatedChildren = sampleChildMovements
        .filter(child => child.parentMovement === macro.slug)
        .map(child => ({
          _type: 'reference',
          _ref: childMovementIds[child.slug],
          _key: child.slug
        }))
        .filter(ref => ref._ref)

      if (relatedChildren.length > 0) {
        await client
          .patch(macroId)
          .set({
            children: relatedChildren
          })
          .commit()
        console.log(`  🔗 Updated ${macro.name} with ${relatedChildren.length} child movements`)
      }
    }

    console.log('🎉 Content population completed successfully!')
    console.log(`
📊 Summary:
  • ${Object.keys(macroMovementIds).length} Macro Movements
  • ${Object.keys(childMovementIds).length} Child Movements  
  • ${Object.keys(workIds).length} Architectural Works
  • ${Object.keys(figureIds).length} Key Figures

🌐 Visit your timeline at: http://localhost:3000
🎨 Manage content at: http://localhost:3000/studio
    `)

  } catch (error) {
    console.error('❌ Error populating content:', error)
    throw error
  }
}

// Only run if called directly
if (require.main === module) {
  populateContent().catch(console.error)
}

export default populateContent