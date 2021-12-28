<style>
  .ts-table--body {
    display: table-row-group;
  }

  /* tbody tr td {
    border-bottom: 2px solid #dee2e6;
    border-top: 1px solid #dee2e6;
    vertical-align: bottom;
    padding: 0.75rem;
  } */
</style>

<script lang="ts">
  import get from 'lodash.get'

  import Cell from './Cell.svelte'
  import Tr from './Tr.svelte'

  import { DerivedPaginationStore } from '../Store/Pagination/store'

  import type { PartialOptions } from '../options'

  export let options: PartialOptions
</script>

{#if $DerivedPaginationStore && $DerivedPaginationStore.data.length > 0}
  <div class="ts-table--body">
    {#each $DerivedPaginationStore.data as cell}
      <Tr className="{options.rowClassName}">
        {#each options.columns as column}
          <Cell
            type="{column.type}"
            cell="{get(cell, column.dataKey)}"
            row="{cell}"
            render="{column.render}"
            onSelect="{column.onSelect}"
            onCellClick="{column.onCellClick}"
          />
        {/each}
      </Tr>
    {/each}
  </div>
{/if}
