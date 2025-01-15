import type { PartialOrUndefined } from '../../lib/prelude.js'
import type { ClientTransports, ClientTransportsConfiguration } from '../../types/context.js'
import { type Context } from '../../types/context.js'
import type { Client } from '../client.js'
import { createProperties } from '../helpers.js'

// todo remove the JSDoc comments below. They will not be shown.
// Look for a TS issue about conditional types + JSDoc comments. If none, create one.

// dprint-ignore
export type TransportMethod<
  $Context extends Context,
  $Extension extends object
> =
  $Context['transports'] extends ClientTransports.States.NonEmpty
    ? {
        /**
         * Configure the current transport.
         * TODO
         */
        // todo just Partial ?
        <configInit extends PartialOrUndefined<$Context['transports']['registry'][$Context['transports']['current']]['configInit']>>
          (configInit: configInit):
            Client<
              {
                [_ in keyof $Context]:
                  _ extends 'transports'
                    ? {
                        registry: $Context['transports']['registry']
                        current: $Context['transports']['current']
                        configurations:
                          keyof configInit extends never
                            ? $Context['transports']['configurations']
                            : {
                                [configKey in keyof $Context['transports']['configurations']]:
                                  configKey extends $Context['transports']['current']
                                // todo: a static configuration resolver particular to the transport is needed
                                // configuration contains a PARTIAL of configuration.
                                // therefore we have to & the given config, since it may add NEW keys
                                    ? {
                                        [configValueKey in keyof $Context['transports']['configurations'][configKey]]:
                                          configValueKey extends keyof configInit
                                            ? unknown
                                            : $Context['transports']['configurations'][configKey][configValueKey]
                                      } & configInit
                                    : $Context['transports']['configurations'][configKey]
                              }
                      }
                    : $Context[_]
              },
              $Extension
            >
        /**
         * Set the current Transport, selected from amongst the registered ones, and optionally change its configuration.
         * TODO
         */
        <
          name extends ClientTransports.GetNames<$Context['transports']>,
          configInit extends undefined | $Context['transports']['registry'][name]['configInit'] = undefined
        >
          (name: name, configInit?: configInit):
            Client<
              {
                [_ in keyof $Context]:
                  _ extends 'transports'
                    ? {
                        registry: $Context['transports']['registry']
                        current: name
                        configurations: keyof configInit extends never
                          ? $Context['transports']['configurations']
                          : {
                            [configKey in keyof $Context['transports']['configurations']]:
                              configKey extends name
                                ?
                                  {
                                    [configValueKey in keyof $Context['transports']['configurations'][configKey]]:
                                      configValueKey extends keyof configInit
                                        ? unknown
                                        : $Context['transports']['configurations'][configKey][configValueKey]
                                  } & configInit
                                  & {debug:configInit}
                                : $Context['transports']['configurations'][configKey]
                          }
                      }
                    : $Context[_]
              },
              $Extension
            >
      }
    : never

export const transportProperties = createProperties((builder, state) => {
  return {
    transport: (...args: [config: object] | [transportName: string, config?: object]) => {
      const transportName = typeof args[0] === `string` ? args[0] : state.transports.current
      const transportConfig = (typeof args[0] === `string` ? args[1] : args[0]) ?? {}
      if (!transportName) {
        throw new Error(`No transport is currently set.`)
      }
      const newContext = reducerTransportConfig(state, transportName, transportConfig)
      return builder(newContext)
    },
  } as any
})

const reducerTransportConfig = (
  state: Context,
  transportName: string,
  newConfigurationInit: ClientTransportsConfiguration,
): Context => {
  const transport = state.transports.registry[transportName]
  if (!transport) throw new Error(`Unknown transport: ${transportName}`)

  const currentConfigurationPartial = state.transports.configurations[transport.name] ?? {}

  // todo: Graceful error handling. Clearly track error being from which extension.
  const newConfigurationPartial = transport.configurationResolver(
    currentConfigurationPartial,
    newConfigurationInit,
  )

  return {
    ...state,
    transports: {
      ...state.transports,
      current: transport.name,
      configurations: {
        ...state.transports.configurations,
        [transport.name]: newConfigurationPartial,
      },
    },
  }
}
