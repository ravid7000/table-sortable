import { writable } from 'svelte/store'

import type { Collection } from '../../options'

export const CollectionStore = writable<Collection>([])
