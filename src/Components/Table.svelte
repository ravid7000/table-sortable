<style>
  table {
    border-collapse: collapse;
    table-layout: auto;
  }

  thead th {
    border-bottom: 2px solid #dee2e6;
    border-top: 1px solid #dee2e6;
    vertical-align: bottom;
    text-align: left;
    padding: 0.75rem;
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .right {
    text-align: right;
  }

  .center {
    text-align: center;
  }
</style>

<script lang="ts">
  import type Column from 'column'

  import { is_function } from 'svelte/internal'

  import Tbody from 'Components/Tbody.svelte'
  import { columnAlign, isColumnSortable } from 'Components/utils'

  import type {
    PaginationButtonsType,
    PaginationType,
  } from 'Store/Pagination/store'

  import type { PartialOptions } from 'options'

  import { SORT_ORDER } from 'enums'

  export let options: PartialOptions
  export let pagination: PaginationType
  export let paginationButtons: PaginationButtonsType

  let sorted = {}

  const handleSortingClick = (idx: number, column: Column) => {
    if (sorted[idx]) {
      if (sorted[idx] === SORT_ORDER.ASC) {
        sorted[idx] = SORT_ORDER.DESC
      } else if (sorted[idx] === SORT_ORDER.DESC) {
        sorted[idx] = null
      }
    } else {
      sorted = {
        [idx]: SORT_ORDER.ASC,
      }
    }

    if (is_function(column.onHeaderClick)) {
      column.onHeaderClick(column)
    }
  }
</script>

{#if options}
  <table class="{options.className}">
    {#if options.columns}
      <thead>
        <tr>
          {#each options.columns as column, idx}
            {#if !column.hide}
              <th
                class="{column.headerClassName}"
                class:clickable="{isColumnSortable(
                  idx,
                  options,
                  column.sorting
                )}"
                class:right="{columnAlign(column.type) === 'right'}"
                class:center="{columnAlign(column.type) === 'center'}"
                on:click="{() => handleSortingClick(idx, column)}"
              >
                {#if is_function(column.headerRender)}
                  {column.headerRender(column.header)}
                {:else}
                  {column.header}
                {/if}
                {#if sorted[idx]}
                  <span class="sorting-icon">
                    {#if sorted[idx] === SORT_ORDER.ASC}
                      {options.sortingIcons.asc}
                    {:else if sorted[idx] === SORT_ORDER.DESC}
                      {options.sortingIcons.desc}
                    {/if}
                  </span>
                {/if}
              </th>
            {/if}
          {/each}
        </tr>
      </thead>
      <Tbody
        options="{options}"
        pagination="{pagination}"
        paginationButtons="{paginationButtons}"
      />
    {/if}
  </table>
{/if}
