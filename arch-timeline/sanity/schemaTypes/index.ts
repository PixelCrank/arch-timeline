import { type SchemaTypeDefinition } from 'sanity'
import macroMovement from '../schemas/macroMovement'
import childMovement from '../schemas/childMovement'
import architecturalWork from '../schemas/architecturalWork'
import keyFigure from '../schemas/keyFigure'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    macroMovement,
    childMovement,
    architecturalWork,
    keyFigure,
  ],
}
