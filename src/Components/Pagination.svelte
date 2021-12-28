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
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    margin: 0;
    background-color: rgb(239, 239, 239);
  }

  button:disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .active {
    background-color: #4CAF50;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
  }

  .button-group {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from 'svelte/internal'

  import type { PaginationButtonsType } from '../Store/Pagination/store'

  export let currentPage: number
  export let totalPages: number
  export let nextText: string = 'Next'
  export let prevText: string = 'Prev'
  export let pages: PaginationButtonsType

  const dispatch = createEventDispatcher()

  const handleBtnClick = (page: number) => {
    dispatch('paginationChange', {
      page: Math.min(totalPages, Math.max(0, page)),
    })
  }
</script>

<div class="pagination">
  <div>
    Showing 
  </div>
  <div class="button-group">
    <button disabled="{currentPage === 0}" on:click="{() => handleBtnClick(currentPage - 1)}" title="Go to previous page">{prevText}</button>
    {#if totalPages > 10}
      <button disabled="{currentPage === 0}" on:click="{() => handleBtnClick(0)}" title="Go to first page">{`<<`}</button>
    {/if}
    {#each pages as page}
      <button
        class:active="{currentPage === page - 1}"
        title="{`Go to page ${page}`}"
        on:click="{() => handleBtnClick(page - 1)}"
      >
        {page}
      </button>
    {/each}
    {#if totalPages > 10}
      <button disabled="{currentPage === totalPages - 1}" on:click="{() => handleBtnClick(totalPages - 1)}" title="Go to last page">{`>>`}</button>
    {/if}
    <button disabled="{currentPage === totalPages - 1}" on:click="{() => handleBtnClick(currentPage + 1)}" title="Go to next page">{nextText}</button>
  </div>
</div>
