<style lang="postcss">
  .ts-table-root {
    color: var(--color-text);
    background-color: var(--color-background);
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
  }

  .ts-table {
    display: table;
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
    box-sizing: border-box;
    border-collapse: collapse;
  }

  .bordered :global(.ts-table--cell) {
    border: 1px solid var(--color-border);
  }

  .bordered :global(.ts-table--head-cell) {
    border: 1px solid var(--color-headerBorder);
    border-bottom: 2px solid var(--color-headerBorder);
  }

  .border-less :global(.ts-table--cell) {
    border: 0;
  }

  .border-less :global(.ts-table--head-cell) {
    border: 0;
  }
</style>

<script lang="ts">
  import Tbody from './Tbody.svelte'
  import Tfoot from './Tfoot.svelte'
  import Thead from './Thead.svelte'

  import type { PartialOptions } from '../options'

  import { classNames, setColorVarsForStyle } from './utils'

  export let options: PartialOptions

  let rootEl: HTMLElement

  $: setColorVarsForStyle(rootEl, options.colors)
</script>

{#if options}
  <div
    class="{classNames('ts-table-root', options.theme)}"
    bind:this="{rootEl}"
  >
    <div class="{classNames('ts-table', options.className?.trim())}">
      <Thead options="{options}" />
      <Tbody options="{options}" />
    </div>
    <Tfoot options="{options}" />
  </div>
{/if}
