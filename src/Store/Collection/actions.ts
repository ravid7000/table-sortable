import cloneDeep from 'lodash.clonedeep'
import keys from 'lodash.keys'

import { get } from 'svelte/store'

import { SORT_ORDER, UNIQUE_ID_KEY } from '../../enums'
import type { Collection } from '../../options'
import {
  CollectionStore,
  DontTouchCollectionStore,
  SortableStore,
} from './store'
import { addUniqueIdInData, matchString, sortData } from './utils'

export const setCollection = (data: Collection) => {
  data = addUniqueIdInData(data)
  CollectionStore.set(data)
  DontTouchCollectionStore.set(cloneDeep(data))
}

export const updateCollection = (data: Collection) => {
  data = addUniqueIdInData(data, get(DontTouchCollectionStore).length)
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

  CollectionStore.set(sortData(data, key, order))
}

export const toggleCheckbox = ({
  id,
  dataKey = '@checked',
  checked,
}: {
  id: string
  dataKey: string
  checked: boolean
}) => {
  const collection = get(DontTouchCollectionStore)

  let index = collection.findIndex((item) => item[UNIQUE_ID_KEY] === id)

  collection[index][dataKey] = checked

  const collectionAll = get(CollectionStore)

  index = collectionAll.findIndex((item) => item[UNIQUE_ID_KEY] === id)

  collectionAll[index][dataKey] = checked

  // Keep both the collection's data in sync
  DontTouchCollectionStore.set(collection)
  CollectionStore.set(collectionAll)
}

export const searchCollection = (search: string) => {
  const collection = get(DontTouchCollectionStore)

  const filteredCollection = collection.filter((item) => {
    return !!keys(item).find((key) => {
      return matchString(item[key], search)
    })
  })

  CollectionStore.set(cloneDeep(filteredCollection))
}
