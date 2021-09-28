<script lang="ts">
  import { createPagination } from './utils';
  import { createEventDispatcher } from 'svelte/internal';

  export let currentPage: number;
  export let totalPages: number;
  export let nextText: string = 'Next';
  export let prevText: string = 'Prev';

  const dispatch = createEventDispatcher();

  $: pages = createPagination({ currentPage, totalPages });

  const handleBtnClick = (page: number) => {
    dispatch('paginationChange', {
      currentPage: Math.min(totalPages, Math.max(0, page)) - 1,
    });
  }
</script>

<div class="pagination">
  <button on:click={() => handleBtnClick(currentPage - 1)}>{prevText}</button>
  {#each pages as page}
    <button class:active={currentPage === page} on:click={() => handleBtnClick(page)}>{page}</button>
  {/each}
  <button on:click={() => handleBtnClick(currentPage + 1)}>{nextText}</button>
</div>