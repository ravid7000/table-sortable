<style>
  button {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    user-select: none;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    margin: 0;
    background-color: var(--color-buttonBg);
    box-sizing: border-box;
    border-radius: 0;
    color: inherit;
  }

  button:disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .active {
    color: #fff;
    background-color: var(--color-primary);
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
  }

  .button-group {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
    box-sizing: border-box;
  }

  .button-group > button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .button-group > button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from 'svelte/internal'

  import type { PaginationType } from '../Store/Pagination/store'

  export let totalRows: number
  export let nextText: string = 'Next'
  export let prevText: string = 'Prev'
  export let pagination: PaginationType

  const dispatch = createEventDispatcher()

  const handleBtnClick = (page: number) => {
    dispatch('paginationChange', {
      page: Math.min(pagination.totalPages, Math.max(0, page)),
    })
  }
</script>

<div class="pagination">
  <div>
    Showing {Math.min(pagination.endIndex, pagination.startIndex + 1)} to {Math.min(
      totalRows,
      pagination.endIndex
    )}
    of {totalRows} entries
  </div>
  <div class="button-group">
    <button
      disabled="{pagination.currentPage === 0}"
      on:click="{() => handleBtnClick(pagination.currentPage - 1)}"
      title="Go to previous page">{prevText}</button
    >
    {#if pagination.totalPages > 10}
      <button
        disabled="{pagination.currentPage === 0}"
        on:click="{() => handleBtnClick(0)}"
        title="Go to first page">&#8810;</button
      >
    {/if}
    {#each pagination.pages as page}
      <button
        class:active="{pagination.currentPage === page - 1}"
        title="{`Go to page ${page}`}"
        on:click="{() => handleBtnClick(page - 1)}"
      >
        {page}
      </button>
    {/each}
    {#if pagination.totalPages > 10}
      <button
        disabled="{pagination.currentPage === pagination.totalPages - 1}"
        on:click="{() => handleBtnClick(pagination.totalPages - 1)}"
        title="Go to last page">&#8811;</button
      >
    {/if}
    <button
      disabled="{pagination.currentPage === pagination.totalPages - 1}"
      on:click="{() => handleBtnClick(pagination.currentPage + 1)}"
      title="Go to next page">{nextText}</button
    >
  </div>
</div>
