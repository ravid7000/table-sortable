import type { PartialOptions } from '../../options'
import { Options } from './store'

export const setOptions = (options: PartialOptions) => {
  Options.set(options)
}

export const updateOptions = (options: PartialOptions) => {
  Options.update((options) => ({ ...options, ...options }))
}
