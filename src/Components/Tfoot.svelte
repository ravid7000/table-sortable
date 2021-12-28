<style>
  .ts-table--foot {
    width: 100%;
  }
</style>

<script lang="ts">
  import Pagination from './Pagination.svelte'

  import { setCurrentPage } from '../Store/Pagination/actions'
  import { DerivedPaginationStore } from '../Store/Pagination/store'

  const handlePaginationChange = (event: CustomEvent<{ page: number }>) => {
    setCurrentPage(event.detail.page)
  }
</script>

{#if $DerivedPaginationStore && $DerivedPaginationStore.data.length > 0}
  <div class="ts-table--foot">
    <Pagination
      pages="{$DerivedPaginationStore.pages}"
      currentPage="{$DerivedPaginationStore.currentPage}"
      totalPages="{$DerivedPaginationStore.totalPages}"
      on:paginationChange="{handlePaginationChange}"
    />
  </div>
{/if}
