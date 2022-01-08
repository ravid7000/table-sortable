<style lang="postcss">
  .ts-table--foot {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem 0;
    background-color: var(--color-footerBg);
    color: var(--color-footer);
  }
</style>

<script lang="ts">
  import Pagination from './Pagination.svelte'

  import { TotalCollection } from '../Store/Collection/store'
  import { setCurrentPage } from '../Store/Pagination/actions'
  import { DerivedPaginationStore } from '../Store/Pagination/store'

  import type { PartialOptions } from '../options'

  export let options: PartialOptions

  const handlePaginationChange = (event: CustomEvent<{ page: number }>) => {
    setCurrentPage(event.detail.page)
  }
</script>

{#if options.pagination && $DerivedPaginationStore}
  <div class="ts-table--foot">
    <Pagination
      pagination="{$DerivedPaginationStore}"
      totalRows="{$TotalCollection}"
      prevText="{options.prevText}"
      nextText="{options.nextText}"
      on:paginationChange="{handlePaginationChange}"
    />
  </div>
{/if}
