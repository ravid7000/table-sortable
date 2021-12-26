import { writable } from 'svelte/store'

import type { SORT_ORDER } from '../../enums'
import type { Collection } from '../../options'

export type SortableStoreType = {
  [key in number | string]: SORT_ORDER
}

export const CollectionStore = writable<Collection>([])

// Don't touch this store. It's used to compare the collection with the original data.
export const DontTouchCollectionStore = writable<Collection>([])

export const SortableStore = writable<SortableStoreType>({})
