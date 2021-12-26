import type { PartialOptions } from '../../options'
import { DefaultOptions, Options } from './store'

export const setOptions = (options: PartialOptions) => {
  Options.set({ ...DefaultOptions, ...options })
}

export const updateOptions = (options: PartialOptions) => {
  Options.update((opt) => ({ ...opt, ...options }))
}
