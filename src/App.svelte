<script lang="ts">
  import Table from 'Components/Table.svelte'

  import {
    getCollection,
    setCollection,
    updateCollection,
  } from 'Store/Collection/actions'
  import * as OptionActions from 'Store/Options/actions'
  import { Options } from 'Store/Options/store'
  import {
    getPaginationData,
    setPaginationData,
  } from 'Store/Pagination/actions'
  import { Pagination, PaginationButtons } from 'Store/Pagination/store'

  import type { Collection, PartialOptions } from 'options'

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
    if (!getPaginationData().length) {
      setPaginationData(data)
    }
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
</script>

{#if $Options}
  <Table
    options="{$Options}"
    pagination="{$Pagination}"
    paginationButtons="{$PaginationButtons}"
  />
{/if}
