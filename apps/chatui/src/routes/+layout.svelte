<script lang="ts">
import "./layout.css";

const { children } = $props();
</script>

<svelte:head><link rel="icon" href="/baumbart-logo.png" /></svelte:head>
{@render children()}
