<script lang="ts">
  import type { Collection, PartialOptions } from "../options";
  import { SORT_ORDER } from "../enums";
  import type Column from "../column";
  import { is_function } from "svelte/internal";
  import { isColumnSortable, columnAlign } from "./utils";
  import Tbody from "./Tbody.svelte";

  export let options: PartialOptions;

  export let collection: Collection;

  let sorted = {};

  const handleSortingClick = (idx: number, column: Column) => {
    if (sorted[idx]) {
      if (sorted[idx] === SORT_ORDER.ASC) {
        sorted[idx] = SORT_ORDER.DESC;
      } else if (sorted[idx] === SORT_ORDER.DESC) {
        sorted[idx] = null;
      }
    } else {
      sorted = {
        [idx]: SORT_ORDER.ASC
      };
    }

    if (is_function(column.onHeaderClick)) {
      column.onHeaderClick(column);
    }
  }
</script>

{#if options}
<table class={options.className}>
  {#if options.columns}
    <thead>
      <tr>
        {#each options.columns as column, idx}
          {#if !column.hide}
            <th
              class={column.headerClassName}
              class:clickable={isColumnSortable(idx, options, column.sorting)}
              class:right={columnAlign(column.type) === 'right'}
              class:center={columnAlign(column.type) === 'center'}
              on:click={() => handleSortingClick(idx, column)}
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
    <Tbody options={options} collection={collection} />
  {/if}
</table>
{/if}

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
    padding: .75rem;
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