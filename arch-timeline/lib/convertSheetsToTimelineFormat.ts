import { MacroMovement, ChildMovement, Subchild } from './timelineData';

// Converts Google Sheets API data to the app's timeline data structure
export function convertSheetsToTimelineFormat(sheetData: any): { macros: MacroMovement[]; children: ChildMovement[] } {
  if (!sheetData || !sheetData.Macros || !sheetData.Movements) return { macros: [], children: [] };

  // Build lookup for Movements, Buildings, Figures
  const movements = sheetData.Movements;
  const buildings = sheetData.Buildings || [];
  const figures = sheetData.Figures || [];

  // Build all child movements (flat array)
  const allChildren: ChildMovement[] = movements.map((m: any) => {
    const subchildren: Subchild[] = [
      ...buildings
        .filter((b: any) => b['Linked Sub-Movement (must match Movements sheet)'] === m['Sub-Movement'])
        .map((b: any) => ({
          id: b['Building Name'],
          name: b['Building Name'],
          type: 'work' as const,
          description: b['Description'] || '',
          imageUrl: b['Image URL'] || '',
          metadata: {
            architect: b['Architect(s)'],
            year: b['Year(s) Built'],
            location: b['City']
          }
        })),
      ...figures
        .filter((f: any) => f['Linked Sub-Movement (must match Movements sheet)'] === m['Sub-Movement'])
        .map((f: any) => ({
          id: f['Architect'],
          name: f['Architect'],
          type: 'figure' as const,
          description: f['Philosophy / Design Approach'] || '',
          imageUrl: f['Image URL'] || '',
          metadata: {
            birthYear: f['Life Dates'],
            // Add more fields as needed
          }
        }))
    ];
    return {
      id: m['Sub-Movement'],
      name: m['Sub-Movement'],
      description: m['Hallmark Traits'] || '',
      years: `${m['Start Year'] || ''}-${m['End Year'] || ''}`,
      start: Number(m['Start Year']) || 0,
      end: Number(m['End Year']) || 0,
      region: m['Region'] || '',
      traits: m['Traits'] ? m['Traits'].split(',').map((t: string) => t.trim()) : [],
      works: subchildren.filter((s) => s.type === 'work'),
      figures: subchildren.filter((s) => s.type === 'figure'),
      parent: m['Macro Parent (choose)'] || '',
      subchildren
    };
  });

  // Helper: get all child movement IDs for a macro
  function getChildIdsForMacro(macroName: string): string[] {
    return allChildren.filter((c) => c.parent === macroName).map((c) => c.id);
  }

  const macros: MacroMovement[] = sheetData.Macros.map((macro: any) => ({
    id: macro['Slug'] || macro['Name'],
    name: macro['Name'],
    description: macro['Description'] || '',
    start: Number(macro['Start']) || 0,
    end: Number(macro['End']) || 0,
    colorClass: macro['colorClass'] || '',
    children: getChildIdsForMacro(macro['Name'])
  }));

  return { macros, children: allChildren };
}
