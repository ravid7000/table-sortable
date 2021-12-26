<script lang="ts">
  import Table from './Components/Table.svelte'

  import {
    getCollection,
    setCollection,
    updateCollection,
  } from './Store/Collection/actions'
  import * as OptionActions from './Store/Options/actions'
  import { Options } from './Store/Options/store'
  import {
    getPaginationData,
    setCurrentPage,
  } from './Store/Pagination/actions'

  import type { Collection, PartialOptions } from './options'

  /**
   * Set runtime data to Table
   * @param data
   * @param update
   */
  export function setData(data: Collection, update?: boolean) {
    if (update) {
      updateCollection(data)
    } else {
      setCollection(data)
    }
    // Whenever data changes, reset pagination
    setCurrentPage(0)
  }

  /**
   * Set runtime options to Table
   * @param options
   * @param update
   */
  export function setOptions(options: PartialOptions, update?: boolean) {
    if (update) {
      OptionActions.updateOptions({ ...options, data: [] })
    } else {
      OptionActions.setOptions({ ...options, data: [] })
    }
    // Whenever options changes, reset pagination
    setCurrentPage(0)
  }

  /**
   * Get table data.
   */
  export function getData() {
    return getCollection()
  }

  /**
   * Get data for current page
   */
  export function getCurrentPageData() {
    return getPaginationData()
  }

  /**
   * Set current page
   */
  export function setPage(page: number) {
    if (typeof page === 'number') {
      setCurrentPage(page);
    }
  }
</script>

{#if $Options}
  {#if $Options.loading}
  Loading...
  {:else}
    <Table
      options="{$Options}"
    />
  {/if}
{/if}
