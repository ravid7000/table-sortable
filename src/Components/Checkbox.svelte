<style>
  input {
    overflow: hidden;
    width: 0;
    height: 0;
    opacity: 0;
    visibility: hidden;
  }

  label {
    display: inline-block;
  }

  .checkbox {
    display: inline-block;
    vertical-align: middle;
    width: 14px;
    height: 14px;
    position: relative;
    border: 2px solid #000;
    cursor: pointer;
  }

  .checkbox::before,
  .checkbox::after {
    content: '';
    position: absolute;
    opacity: 0;
    visibility: hidden;
    transition: all 0.1s ease-in-out;
    background: #000;
    height: 2px;
  }

  .checkbox::before {
    width: 5px;
    top: 7px;
    left: 1px;
    transform: rotate(45deg);
  }

  .checkbox::after {
    width: 9px;
    top: 6px;
    left: 4px;
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

<label for="{id}" on:click>
  <input checked="{checked}" on:click type="checkbox" id="{id}" />
  <span class="checkbox" class:checked></span>
</label>
