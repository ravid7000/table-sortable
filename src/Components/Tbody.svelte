<style>
  .right {
    text-align: right;
  }

  .center {
    text-align: center;
  }

  tbody tr td {
    /* border-bottom: 2px solid #dee2e6; */
    border-top: 1px solid #dee2e6;
    vertical-align: bottom;
    padding: 0.75rem;
  }
</style>

<script lang="ts">
  import get from 'lodash.get'
  import { createEventDispatcher } from 'svelte'

  import Cell from 'Components/Cell.svelte'
  import Pagination from 'Components/Pagination.svelte'
  import { columnAlign } from 'Components/utils'

  import type {
    PaginationButtonsType,
    PaginationType,
  } from 'Store/Pagination/store'

  import type { PartialOptions } from 'options'

  export let options: PartialOptions
  export let pagination: PaginationType
  export let paginationButtons: PaginationButtonsType

  let td = {}

  let dispatch = createEventDispatcher()

  const handlePaginationChange = (event: CustomEvent<{ page: number }>) => {
    dispatch('paginationChange', { page: event.detail.page })
  }
</script>

{#if pagination && pagination.data.length > 0}
  <tbody>
    {#each pagination.data as cell, cellIdx}
      <tr class="{options.rowClassName}">
        {#each options.columns as column, idx}
          <td
            class:right="{columnAlign(column.type) === 'right'}"
            class:center="{columnAlign(column.type) === 'center'}"
            bind:this="{td[`${cellIdx}-${idx}`]}"
          >
            <Cell
              cell="{get(cell, column.dataKey)}"
              row="{cell}"
              render="{column.render}"
              td="{td[`${cellIdx}-${idx}`]}"
            />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <Pagination
      pages="{paginationButtons}"
      currentPage="{pagination.currentPage + 1}"
      totalPages="{pagination.totalPages}"
      on:paginationChange="{handlePaginationChange}"
    />
  </tfoot>
{/if}
