<style>
  button {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #ccc;
  }

  .active {
    background-color: #4CAF50;
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
      page: Math.min(totalPages, Math.max(0, page)) - 1,
    })
  }
</script>

<div class="pagination">
  <button disabled="{currentPage === 1}" on:click="{() => handleBtnClick(currentPage - 1)}" title="Go to previous page">{prevText}</button>
  {#if totalPages > 10}
    <button disabled="{currentPage === 1}" on:click="{() => handleBtnClick(1)}" title="Go to first page">{`<<`}</button>
  {/if}
  {#each pages as page}
    <button
      class:active="{currentPage === page}"
      title="{`Go to page ${page}`}"
      on:click="{() => handleBtnClick(page)}"
    >
      {page}
    </button>
  {/each}
  {#if totalPages > 10}
    <button disabled="{currentPage === totalPages}" on:click="{() => handleBtnClick(totalPages)}" title="Go to last page">{`>>`}</button>
  {/if}
  <button disabled="{currentPage === totalPages}" on:click="{() => handleBtnClick(currentPage + 1)}" title="Go to next page">{nextText}</button>
</div>
