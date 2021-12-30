<style>
  .ts-table {
    display: table;
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
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
