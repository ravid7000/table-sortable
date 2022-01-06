<style lang="postcss">
  .ts-table--cell {
    display: table-cell;
    vertical-align: top;
    padding: 0.95rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
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

  import { toggleCheckbox } from '../Store/Collection/actions'

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
  export let currentPage: number
  export let rowsPerPage: number
  export let dataIndex: number
  export let dataKey: string

  let tableCellElement: HTMLElement

  const handleCellClick = () => {
    if (is_function(onCellClick)) {
      const rowIndex = dataIndex + (currentPage - 1) * rowsPerPage
      onCellClick(cell, row, rowIndex)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    let handled = false
    const rowIndex = dataIndex + currentPage * rowsPerPage
    if (is_function(onSelect)) {
      handled = onSelect(cell, row, checked, rowIndex)
    }

    if (!handled) {
      toggleCheckbox({
        checked,
        index: rowIndex,
        dataKey,
      })
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
