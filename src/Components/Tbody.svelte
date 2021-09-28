<script lang="ts">
  import type { Collection, PartialOptions } from "../options";
  import { columnAlign, paginatedData } from "./utils";
  import get from "lodash.get";
  import { is_function } from "svelte/internal";
  import Pagination from "./Pagination.svelte";
  import Cell from "./Cell.svelte";

  export let collection: Collection = [];
  export let options: PartialOptions;

  let currentPage = 0;

  let td = {};

  $: paginated = paginatedData(collection, options, currentPage);
</script>

{#if paginated.data.length > 0}
<tbody>
  {#each paginated.data as cell, cellIdx}
    <tr class={options.rowClassName}>
      {#each options.columns as column, idx}
        <td
          class:right={columnAlign(column.type) === 'right'}
          class:center={columnAlign(column.type) === 'center'}
          bind:this={td[`${cellIdx}-${idx}`]}
        >
          <Cell
            cell={get(cell, column.dataKey)}
            row={cell}
            render={column.render}
            td={td[`${cellIdx}-${idx}`]}
          />
        </td>
      {/each}
    </tr>
  {/each}
</tbody>
<tfoot>
  <Pagination
    currentPage={paginated.currentPage + 1}
    totalPages={paginated.totalPages}
    on:paginationChange={(event) => currentPage = event.detail.currentPage}
  />
</tfoot>
{/if}

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
    padding: .75rem;
  }
</style>