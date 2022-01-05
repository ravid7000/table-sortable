<style>
  .ts-table--head {
    display: table-header-group;
    box-sizing: border-box;
    background-color: var(--color-headerBg);
    color: var(--color-header);
  }

  .ts-table--head-cell {
    display: table-cell;
    font-weight: bold;
    padding: 0.9rem 0.75rem;
    box-sizing: border-box;
    border-top: 1px solid var(--color-headerBorder);
    border-bottom: 2px solid var(--color-headerBorder);
  }

  .cell-checkbox {
    width: 2.6rem;
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

  import Tr from './Tr.svelte'

  import { sortCollection } from '../Store/Collection/actions'
  import { SortableStore } from '../Store/Collection/store'

  import type { PartialOptions } from '../options'

  import { ColumnTypes, SORT_ORDER } from '../enums'

  import type Column from '../column'
  import { classNames, columnAlign, isColumnSortable } from './utils'

  export let options: PartialOptions

  const handleSortingClick = (key: string, column: Column) => {
    if (column.type !== ColumnTypes.checkbox) {
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
  }
</script>

{#if options && options.columns}
  <div class="ts-table--head">
    <Tr>
      {#each options.columns as column, idx}
        {#if !column.hide}
          <div
            class="{classNames('ts-table--head-cell', column.headerClassName)}"
            class:clickable="{isColumnSortable(
              idx,
              options,
              column.sorting,
              column.type
            )}"
            class:right="{columnAlign(column.type) === 'right'}"
            class:center="{columnAlign(column.type) === 'center'}"
            class:cell-checkbox="{column.type === ColumnTypes.checkbox}"
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
          </div>
        {/if}
      {/each}
    </Tr>
  </div>
{/if}
