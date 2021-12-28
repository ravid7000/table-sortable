<style>
  .ts-table--cell {
    display: table-cell;
  }

  .right {
    text-align: right;
  }

  .center {
    text-align: center;
  }
</style>

<script lang="ts">
  import { is_function, onMount } from 'svelte/internal'

  import { ColumnTypes } from '../enums'

  import type Column from '../column'
  import type { ClassNamesType } from '../types'
  import { classNames, columnAlign } from './utils'

  export let render: Column['render']
  export let cell: string | number | string[]
  export let row: unknown
  export let type: keyof typeof ColumnTypes
  export let className: ClassNamesType = ''

  let tableCellElement: HTMLElement

  onMount(() => {
    if (is_function(render)) {
      render(tableCellElement, cell, row)
    }
  })
</script>

<div
  bind:this="{tableCellElement}"
  class="{classNames('ts-table--cell', className, {
    right: columnAlign(type) === 'right',
    center: columnAlign(type) === 'center',
  })}"
>
  {#if type === ColumnTypes.checkbox}
    <input type="checkbox" />
  {:else if cell}
    <span>{cell}</span>
  {/if}
</div>
