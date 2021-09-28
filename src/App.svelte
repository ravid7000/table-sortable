<script lang="ts">
  import { options, collection } from "./Store";
  import Table from "./Components/Table.svelte";
</script>

{#if $options}
<Table options={$options} collection={$collection} />
{/if}
