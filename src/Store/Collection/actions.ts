import cloneDeep from 'lodash.clonedeep'

import { get } from 'svelte/store'

import type { SORT_ORDER } from '../../enums'
import type { Collection } from '../../options'
import {
  CollectionStore,
  DontTouchCollectionStore,
  SortableStore,
} from './store'
import { sortData } from './utils'

export const setCollection = (data: Collection) => {
  CollectionStore.set(data)
  DontTouchCollectionStore.set(cloneDeep(data))
}

export const updateCollection = (data: Collection) => {
  CollectionStore.update((collection) => [...collection, ...data])
  DontTouchCollectionStore.update((collection) =>
    cloneDeep([...collection, ...data])
  )
}

export const getCollection = () => get(CollectionStore)

export const sortCollection = (key: string, order: SORT_ORDER) => {
  if (order === null) {
    SortableStore.set({})
  } else {
    SortableStore.set({
      [key]: order,
    })
  }

  const data = cloneDeep(get(DontTouchCollectionStore))

  console.log({ order, key })
  console.log({ data })

  CollectionStore.set(sortData(data, key, order))
}
