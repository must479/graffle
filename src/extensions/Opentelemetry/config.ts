import type { Transport } from '../../types/Transport.js'

export type ConfigurationInit = {
  /**
   * @defaultValue `"opentelemetry"`
   */
  tracerName?: string
}

export type Configuration = {
  tracerName: string
}

export const configurationDefaults = {
  tracerName: `graffle`,
} satisfies Partial<Configuration>

export const normalizeConfig: Transport.ConfigurationResolver<ConfigurationInit, Configuration> = (current, init) => {
  const newConfigurationPartial: Partial<Configuration> = {
    ...current,
  }

  if (init?.tracerName) newConfigurationPartial.tracerName = init.tracerName

  return newConfigurationPartial
}
