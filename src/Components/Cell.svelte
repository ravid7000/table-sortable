<style>
  .ts-table--cell {
    display: table-cell;
    vertical-align: middle;
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

  import Checkbox from './Checkbox.svelte'

  import { ColumnTypes } from '../enums'

  import type Column from '../column'
  import type { ClassNamesType } from '../types'
  import { classNames, columnAlign } from './utils'

  export let render: Column['render']
  export let onSelect: Column['onSelect']
  export let onCellClick: Column['onCellClick']
  export let cell: string | number | string[]
  export let row: unknown
  export let type: keyof typeof ColumnTypes
  export let className: ClassNamesType = ''

  let tableCellElement: HTMLElement

  const handleCellClick = () => {
    if (is_function(onCellClick)) {
      onCellClick(cell, row)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    if (is_function(onSelect)) {
      onSelect(cell, row, checked)
    }
  }

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
  on:click="{handleCellClick}"
>
  {#if type === ColumnTypes.checkbox}
    <Checkbox
      checked="{!!cell}"
      on:click="{() => handleCheckboxChange(!!!cell)}"
    />
  {:else if cell}
    <span>{cell}</span>
  {/if}
</div>
