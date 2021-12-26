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

  import Cell from './Cell.svelte'
  import Pagination from './Pagination.svelte'

  import {
    DerivedPaginationStore,
  } from '../Store/Pagination/store'
  import { setCurrentPage } from '../Store/Pagination/actions'

  import type { PartialOptions } from '../options'

  import { columnAlign } from './utils'

  export let options: PartialOptions

  let td = {}

  const handlePaginationChange = (event: CustomEvent<{ page: number }>) => {
    setCurrentPage(event.detail.page);
  }
</script>

{#if $DerivedPaginationStore && $DerivedPaginationStore.data.length > 0}
  <tbody>
    {#each $DerivedPaginationStore.data as cell, cellIdx}
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
      pages="{$DerivedPaginationStore.pages}"
      currentPage="{$DerivedPaginationStore.currentPage + 1}"
      totalPages="{$DerivedPaginationStore.totalPages}"
      on:paginationChange="{handlePaginationChange}"
    />
  </tfoot>
{/if}
