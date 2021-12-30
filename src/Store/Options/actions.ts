import type { PartialOptions } from '../../options'
import { DefaultOptions, Options } from './store'

export const setOptions = (options: PartialOptions) => {
  Options.set({
    ...DefaultOptions,
    ...options,
    colors: {
      ...DefaultOptions.colors,
      ...options.colors,
    },
    sortingIcons: {
      ...DefaultOptions.sortingIcons,
      ...options.sortingIcons,
    },
  })
}

export const updateOptions = (options: PartialOptions) => {
  Options.update((opt) => ({
    ...opt,
    ...options,
    colors: {
      ...DefaultOptions.colors,
      ...options.colors,
    },
    sortingIcons: {
      ...DefaultOptions.sortingIcons,
      ...options.sortingIcons,
    },
  }))
}
