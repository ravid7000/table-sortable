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
  import { is_function } from 'svelte/internal'

  import Tbody from './Tbody.svelte'

  import type { PartialOptions } from '../options'

  import { SORT_ORDER } from '../enums'

  import type Column from '../column'
  import { columnAlign, isColumnSortable } from './utils'

  import { SortableStore } from '../Store/Collection/store';
  import { sortCollection } from '../Store/Collection/actions';

  export let options: PartialOptions

  const handleSortingClick = (key: string, column: Column) => {
    let nextOrder = SORT_ORDER.ASC
    if ($SortableStore[key] === SORT_ORDER.ASC) {
      nextOrder = SORT_ORDER.DESC
    } else if ($SortableStore[key] === SORT_ORDER.DESC) {
      nextOrder = null
    }

    sortCollection(key, nextOrder)

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
                on:click="{() => handleSortingClick(column.dataKey, column)}"
              >
                {#if is_function(column.headerRender)}
                  {column.headerRender(column.header)}
                {:else}
                  {column.header}
                {/if}
                {#if $SortableStore[column.dataKey]}
                  <span class="sorting-icon">
                    {#if $SortableStore[column.dataKey] === SORT_ORDER.ASC}
                      {options.sortingIcons.asc}
                    {:else if $SortableStore[column.dataKey] === SORT_ORDER.DESC}
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
      />
    {/if}
  </table>
{/if}
