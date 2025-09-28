// GROQ queries for fetching architecture timeline data from Sanity

export const MACRO_MOVEMENTS_QUERY = `
  *[_type == "macroMovement"] | order(order asc, startYear asc) {
    _id,
    name,
    "slug": slug.current,
    startYear,
    endYear,
    description,
    colorClass,
    "image": image.asset->url,
    order,
    "children": children[]-> {
      _id,
      name,
      "slug": slug.current
    }
  }
`

export const CHILD_MOVEMENTS_QUERY = `
  *[_type == "childMovement"] | order(startYear asc) {
    _id,
    name,
    "slug": slug.current,
    startYear,
    endYear,
    region,
    description,
    traits,
    "image": image.asset->url,
    "parentMovement": parentMovement-> {
      _id,
      name,
      "slug": slug.current
    },
    "works": works[]-> {
      _id,
      name,
      year,
      "slug": slug.current
    },
    "figures": figures[]-> {
      _id,
      name,
      role,
      activeYear,
      birthYear,
      "slug": slug.current
    }
  }
`

export const ARCHITECTURAL_WORKS_QUERY = `
  *[_type == "architecturalWork"] | order(year asc) {
    _id,
    name,
    "slug": slug.current,
    year,
    yearRange,
    location,
    description,
    "image": image.asset->url,
    "gallery": gallery[].asset->url,
    significance,
    style,
    materials,
    dimensions,
    "architect": architect[]-> {
      _id,
      name,
      role,
      "slug": slug.current
    },
    "parentMovement": parentMovement-> {
      _id,
      name,
      "slug": slug.current
    }
  }
`

export const KEY_FIGURES_QUERY = `
  *[_type == "keyFigure"] | order(coalesce(birthYear, activeYear) asc) {
    _id,
    name,
    "slug": slug.current,
    birthYear,
    deathYear,
    activeYear,
    role,
    description,
    nationality,
    "image": image.asset->url,
    keyContributions,
    influences,
    legacy,
    "parentMovement": parentMovement-> {
      _id,
      name,
      "slug": slug.current
    },
    "notableWorks": notableWorks[]-> {
      _id,
      name,
      year,
      "slug": slug.current
    }
  }
`

// Combined query for timeline page
export const TIMELINE_DATA_QUERY = `
{
  "macroMovements": *[_type == "macroMovement"] | order(order asc, startYear asc) {
    _id,
    name,
    "slug": slug.current,
    startYear,
    endYear,
    description,
    colorClass,
    "image": image.asset->url,
    order
  },
  "childMovements": *[_type == "childMovement"] | order(startYear asc) {
    _id,
    name,
    "slug": slug.current,
    startYear,
    endYear,
    region,
    traits,
    "image": image.asset->url,
    "parentMovement": parentMovement->.slug.current,
    "works": works[]-> {
      _id,
      name,
      year,
      location,
      "image": image.asset->url
    },
    "figures": figures[]-> {
      _id,
      name,
      role,
      coalesce(birthYear, activeYear) as timelineYear
    }
  },
  "works": *[_type == "architecturalWork"] {
    _id,
    name,
    year,
    location,
    "image": image.asset->url,
    "parentMovement": parentMovement->.slug.current
  },
  "figures": *[_type == "keyFigure"] {
    _id,
    name,
    role,
    coalesce(birthYear, activeYear) as timelineYear,
    "parentMovement": parentMovement->.slug.current
  }
}`