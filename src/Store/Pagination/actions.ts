import { get } from 'svelte/store'

import { CurrentPageStore, DerivedPaginationStore } from './store'

export const setCurrentPage = (currentPage: number) => {
  CurrentPageStore.set(currentPage)
}

export const getPaginationData = () => get(DerivedPaginationStore).data
