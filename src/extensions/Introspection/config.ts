import type { GraphQLSchema, IntrospectionOptions } from 'graphql'
import type { InputIntrospectionOptions } from '../../generator/_.js'

export type ConfigurationInit = {
  /**
   * The schema instance or endpoint to introspect.
   * By default uses the value the client was constructed with.
   */
  schema?: SchemaTarget
  /**
   * The introspection query options. By default all kinds of information are sought.
   *
   * Where those options are known to be optional by valid GraphQL servers then they start enabled but are
   * progressively disabled upon introspection failure until success or no more known potentially
   * unsupported features remain.
   */
  options?: InputIntrospectionOptions
}

export type Configuration = {
  schema: SchemaTarget | null
  options: IntrospectionOptions
}

type SchemaTarget = string | URL | GraphQLSchema

export const configurationDefaults: Configuration = {
  schema: null,
  options: {
    descriptions: true,
    specifiedByUrl: true,
    directiveIsRepeatable: true,
    schemaDescription: true,
    inputValueDeprecation: true,
    oneOf: true,
  },
}
