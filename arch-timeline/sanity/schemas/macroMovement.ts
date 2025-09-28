export default {
  name: 'macroMovement',
  title: 'Macro Movement',
  type: 'document',
  icon: () => '🏛️',
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
      description: 'Use negative numbers for BCE (e.g., -3000 for 3000 BCE)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      description: 'Use negative numbers for BCE (e.g., -332 for 332 BCE)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'colorClass',
      title: 'Color Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Blue (Ancient)', value: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' },
          { title: 'Purple (Medieval)', value: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' },
          { title: 'Emerald (Renaissance)', value: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white' },
          { title: 'Rose (Imperial)', value: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white' },
          { title: 'Cyan (Industrial)', value: 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white' },
          { title: 'Orange (Modern)', value: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white' },
          { title: 'Fuchsia (Postmodern)', value: 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white' },
          { title: 'Amber (Contemporary)', value: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
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
      name: 'children',
      title: 'Child Movements',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'childMovement' } }],
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this movement appears in the timeline',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'startYear',
      media: 'image',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection;
      const yearLabel = subtitle < 0 ? `${Math.abs(subtitle)} BCE` : `${subtitle} CE`;
      return {
        title,
        subtitle: `Starting ${yearLabel}`,
        media: selection.media,
      };
    },
  },
}