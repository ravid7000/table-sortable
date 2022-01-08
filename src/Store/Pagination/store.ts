import cloneDeep from 'lodash.clonedeep'

import { Readable, derived, writable } from 'svelte/store'

import { CollectionStore } from '../Collection/store'
import { Options } from '../Options/store'
import type { PaginationType } from './types'
import { createPages, createPaginationBasis } from './utils'

export type PaginationButtonsType = number[]

export const CurrentPageStore = writable(0)

export const DerivedPaginationStore: Readable<PaginationType> = derived(
  [Options, CollectionStore, CurrentPageStore],
  ([options, collection, currentPage]) =>
    createPaginationBasis(options, collection, currentPage)
)
