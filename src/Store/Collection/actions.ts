import { get } from 'svelte/store'

import type { Collection } from '../../options'
import { CollectionStore } from './store'

export const setCollection = (data: Collection) => {
  CollectionStore.set(data)
}

export const updateCollection = (data: Collection) => {
  CollectionStore.update((collection) => [...collection, ...data])
}

export const getCollection = () => get(CollectionStore)
