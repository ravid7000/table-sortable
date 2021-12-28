<style>
  .ts-table {
    display: table;
    width: 100%;
    max-width: 100%;
  }

  .ts-table--head {
    display: table-header-group;
  }

  .ts-table--head-cell {
    display: table-cell;
    font-weight: bold;
    vertical-align: middle;
  }

  /* thead th {
    border-bottom: 2px solid #dee2e6;
    border-top: 1px solid #dee2e6;
    vertical-align: bottom;
    text-align: left;
    padding: 0.75rem;
  } */

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
  import Tbody from './Tbody.svelte'
  import Tfoot from './Tfoot.svelte'
  import Thead from './Thead.svelte'

  import type { PartialOptions } from '../options'

  import { classNames } from './utils'

  export let options: PartialOptions
</script>

{#if options}
  <div class="{classNames('ts-table', options.className?.trim())}">
    <Thead options="{options}" />
    <Tbody options="{options}" />
  </div>
  <Tfoot />
{/if}
