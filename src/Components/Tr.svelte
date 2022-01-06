<style lang="postcss">
  .ts-table--row {
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;
    box-sizing: border-box;
  }
</style>

<script lang="ts">
  import { classNames } from './utils'

  export let className: string = ''
</script>

<div class="{classNames('ts-table--row', className)}">
  <slot />
</div>
