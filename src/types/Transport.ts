import type { Anyware } from '../lib/anyware/__.js'
import type { RequestPipelineBaseDefinition } from '../requestPipeline/__.js'

export interface Transport {
  name: string
  config: object
  configInit: object
  configDefaults: object | undefined
  requestPipelineOverload: Anyware.Overload
  configurationResolver: Transport.ConfigurationResolver
}

export namespace Transport {
  export type ConfigurationResolver<
    $ConfigurationInit extends object = object,
    $Configuration extends $ConfigurationInit = $ConfigurationInit,
  > = (currentPartial: Partial<$Configuration>, init?: $ConfigurationInit) => Partial<$Configuration>

  export const defaultConfigurationResolver: ConfigurationResolver = (currentPartial, init) => ({
    ...currentPartial,
    ...init,
  })

  export namespace Builder {
    export interface Namespace {
      create: Create
    }

    export interface Create {
      <$Name extends string>(name: $Name): Anyware.Overload.Builder<RequestPipelineBaseDefinition, {
        discriminant: ['transportType', $Name]
        input: {}
        steps: {}
      }>
    }
  }
}
