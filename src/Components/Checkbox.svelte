<style lang="postcss">
  .checkbox {
    display: inline-block;
    vertical-align: top;
    width: 18px;
    height: 18px;
    position: relative;
    border: 2px solid var(--color-text);
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 2px;
  }

  .checkbox::before,
  .checkbox::after {
    content: '';
    position: absolute;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease-in-out;
    background: var(--color-text);
    height: 2px;
  }

  .checkbox::before {
    width: 5px;
    top: 7px;
    left: 1px;
    transform: rotate(45deg);
  }

  .checkbox::after {
    width: 11px;
    top: 6px;
    left: 3px;
    transform: rotate(-45deg);
  }

  .checked.checkbox::before,
  .checked.checkbox::after {
    opacity: 1;
    visibility: visible;
  }
</style>

<script lang="ts">
  export let checked: boolean = false
  export let id: string = ''
</script>

<span id="{id}" on:click class="checkbox" class:checked></span>
