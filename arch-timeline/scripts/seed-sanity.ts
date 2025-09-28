import { createClient } from '@sanity/client'

// Initialize Sanity client for setup
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-09-22',
  token: process.env.SANITY_API_TOKEN, // Only needed for mutations
  useCdn: false,
})

// Sample data to populate the CMS
const sampleMacroMovement = {
  _type: 'macroMovement',
  name: 'Ancient & Classical Traditions',
  slug: { _type: 'slug', current: 'ancient-classical' },
  startYear: -3000,
  endYear: 500,
  description: 'The foundational architectural traditions from ancient civilizations',
  colorClass: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
  order: 1,
}

const sampleChildMovement = {
  _type: 'childMovement',
  name: 'Ancient Egyptian',
  slug: { _type: 'slug', current: 'ancient-egyptian' },
  startYear: -3000,
  endYear: -332,
  region: 'Egypt',
  description: 'Monumental architecture characterized by massive stone construction and religious symbolism',
  traits: ['Monumental stone', 'Axiality', 'Post-and-lintel', 'Pyramids'],
}

const sampleArchitecturalWork = {
  _type: 'architecturalWork',
  name: 'Great Pyramid of Giza',
  slug: { _type: 'slug', current: 'great-pyramid-giza' },
  year: -2580,
  location: 'Giza, Egypt',
  description: 'The largest of the three pyramids in the Giza complex, originally standing at 146.5 meters tall',
  significance: 'One of the Seven Wonders of the Ancient World and a testament to ancient engineering prowess',
  style: 'Old Kingdom Egyptian',
  materials: ['Limestone', 'Granite', 'Mortar'],
  dimensions: 'Base: 230.4m × 230.4m, Original height: 146.5m',
}

const sampleKeyFigure = {
  _type: 'keyFigure',
  name: 'Imhotep',
  slug: { _type: 'slug', current: 'imhotep' },
  activeYear: -2650,
  role: 'architect',
  description: 'Ancient Egyptian architect, physician, and polymath, credited with designing the Step Pyramid of Djoser',
  nationality: 'Egyptian',
  keyContributions: [
    'First known architect in history',
    'Pioneered stone construction techniques',
    'Designed the first pyramid',
  ],
  legacy: 'Deified after death and revered as a god of medicine and wisdom',
}

export async function seedSanityData() {
  try {
    console.log('Creating sample data in Sanity...')
    
    // Create documents
    const macroResult = await client.create(sampleMacroMovement)
    console.log('Created macro movement:', macroResult.name)
    
    const childResult = await client.create({
      ...sampleChildMovement,
      parentMovement: { _ref: macroResult._id, _type: 'reference' }
    })
    console.log('Created child movement:', childResult.name)
    
    const workResult = await client.create({
      ...sampleArchitecturalWork,
      parentMovement: { _ref: childResult._id, _type: 'reference' }
    })
    console.log('Created architectural work:', workResult.name)
    
    const figureResult = await client.create({
      ...sampleKeyFigure,
      parentMovement: { _ref: childResult._id, _type: 'reference' }
    })
    console.log('Created key figure:', figureResult.name)
    
    // Update references
    await client.patch(macroResult._id).setIfMissing({ children: [] }).append('children', [{ _ref: childResult._id, _type: 'reference' }]).commit()
    await client.patch(childResult._id).setIfMissing({ works: [], figures: [] })
      .append('works', [{ _ref: workResult._id, _type: 'reference' }])
      .append('figures', [{ _ref: figureResult._id, _type: 'reference' }])
      .commit()
    
    console.log('✅ Sample data created successfully!')
    console.log('🎨 Visit /studio to manage your content')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedSanityData()
}