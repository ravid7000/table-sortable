<style>
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
  <button on:click="{() => handleBtnClick(currentPage - 1)}">{prevText}</button>
  {#if totalPages > 10}
    <button on:click="{() => handleBtnClick(1)}">{`<<`}</button>
  {/if}
  {#each pages as page}
    <button
      class:active="{currentPage === page}"
      on:click="{() => handleBtnClick(page)}">{page}</button
    >
  {/each}
  {#if totalPages > 10}
    <button on:click="{() => handleBtnClick(totalPages)}">{`>>`}</button>
  {/if}
  <button on:click="{() => handleBtnClick(currentPage + 1)}">{nextText}</button>
</div>
