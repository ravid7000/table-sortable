<script lang="ts">
  import { is_function } from 'svelte/internal'

  import type Column from '../column'

  export let render: Column['render']
  export let td: HTMLTableCellElement
  export let cell: unknown
  export let row: unknown

  $: {
    if (td && is_function(render)) {
      render(td, cell, row)
    }
  }
</script>

{#if cell}
<span>{cell}</span>
{/if}
