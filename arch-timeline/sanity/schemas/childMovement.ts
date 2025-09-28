export default {
  name: 'childMovement',
  title: 'Child Movement',
  type: 'document',
  icon: () => '🏗️',
  fields: [
    {
      name: 'name',
      title: 'Movement Name',
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
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      description: 'Use negative numbers for BCE',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      description: 'Use negative numbers for BCE',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'region',
      title: 'Geographic Region',
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
      name: 'traits',
      title: 'Key Traits',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key architectural characteristics',
    },
    {
      name: 'image',
      title: 'Representative Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'parentMovement',
      title: 'Parent Macro Movement',
      type: 'reference',
      to: { type: 'macroMovement' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'works',
      title: 'Notable Works',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'architecturalWork' } }],
    },
    {
      name: 'figures',
      title: 'Key Figures',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'keyFigure' } }],
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'region',
      media: 'image',
    },
  },
}