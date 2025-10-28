
// Timeline data types (matching current Google Sheets data structure)

export interface Subchild {
  id: string;
  name: string;
  type: 'work' | 'figure';
  description: string;
  imageUrl?: string;
  metadata: {
    architect?: string;
    year?: number;
    location?: string;
    birthYear?: number;
    deathYear?: number;
  };
}

export interface ChildMovement {
  id: string;
  name: string;
  description?: string;
  years?: string;
  start?: number;
  end?: number;
  startYear?: number;
  endYear?: number;
  position?: number;
  region?: string;
  traits?: string[];
  works?: Subchild[];
  figures?: Subchild[];
  parent?: string;
  subchildren?: Subchild[];
}

export interface MacroMovement {
  id: string;
  name: string;
  description: string;
  years: string;
  startYear: number;
  endYear: number;
  color: string;
  position: number;
  children: ChildMovement[];
}
