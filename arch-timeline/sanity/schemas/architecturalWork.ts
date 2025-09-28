export default {
  name: 'architecturalWork',
  title: 'Architectural Work',
  type: 'document',
  icon: () => '🏛️',
  fields: [
    {
      name: 'name',
      title: 'Work Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year Built',
      type: 'number',
      description: 'Use negative numbers for BCE',
    },
    {
      name: 'yearRange',
      title: 'Year Range (if applicable)',
      type: 'string',
      description: 'e.g., "447-432 BCE" for construction period',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'architect',
      title: 'Architect(s)',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'keyFigure' } }],
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'gallery',
      title: 'Additional Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    },
    {
      name: 'parentMovement',
      title: 'Parent Movement',
      type: 'reference',
      to: { type: 'childMovement' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'significance',
      title: 'Historical Significance',
      type: 'text',
      rows: 3,
    },
    {
      name: 'style',
      title: 'Architectural Style',
      type: 'string',
    },
    {
      name: 'materials',
      title: 'Key Materials',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'Key measurements or scale information',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'image',
    },
  },
}