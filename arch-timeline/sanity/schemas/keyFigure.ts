export default {
  name: 'keyFigure',
  title: 'Key Figure',
  type: 'document',
  icon: () => '👤',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
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
      name: 'birthYear',
      title: 'Birth Year',
      type: 'number',
      description: 'Use negative numbers for BCE. Leave empty if unknown.',
    },
    {
      name: 'deathYear',
      title: 'Death Year',
      type: 'number',
      description: 'Use negative numbers for BCE. Leave empty if unknown.',
    },
    {
      name: 'activeYear',
      title: 'Active Year (if birth/death unknown)',
      type: 'number',
      description: 'Primary year of activity for timeline positioning',
    },
    {
      name: 'role',
      title: 'Primary Role',
      type: 'string',
      options: {
        list: [
          { title: 'Architect', value: 'architect' },
          { title: 'Engineer', value: 'engineer' },
          { title: 'Urban Planner', value: 'urbanist' },
          { title: 'Theorist', value: 'theorist' },
          { title: 'Builder/Master Mason', value: 'builder' },
          { title: 'Patron/Commissioner', value: 'patron' },
          { title: 'Scholar', value: 'scholar' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Biography',
      type: 'text',
      rows: 4,
    },
    {
      name: 'nationality',
      title: 'Nationality/Origin',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Portrait/Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'parentMovement',
      title: 'Associated Movement',
      type: 'reference',
      to: { type: 'childMovement' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'notableWorks',
      title: 'Notable Works',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'architecturalWork' } }],
    },
    {
      name: 'keyContributions',
      title: 'Key Contributions',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Major contributions to architecture',
    },
    {
      name: 'influences',
      title: 'Influences',
      type: 'text',
      description: 'Who or what influenced their work',
    },
    {
      name: 'legacy',
      title: 'Legacy',
      type: 'text',
      description: 'Impact on later architecture',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection;
      return {
        title,
        subtitle: subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : '',
        media: selection.media,
      };
    },
  },
}