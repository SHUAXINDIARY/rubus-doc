<script>
  import { Cornerstone } from "@rubus/rubus/src";
  import { setContext, getContext, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { Nav } from "../components";
  export let segment;

  const rubusDocConfig = writable({
    name: "Rubus",
    lang: "zh",
    theme: "light",
  });
  setContext("rubusDocConfig", rubusDocConfig);
  let _rubusDocConfig = getContext("rubusDocConfig");

  onMount(() => {
    if (window.localStorage.getItem("rubus-local-config-theme")) {
      $_rubusDocConfig.theme = window.localStorage.getItem("rubus-local-config-theme");
    } else {
      window.localStorage.setItem("rubus-local-config-theme", $_rubusDocConfig.theme);
    }
    if (window.localStorage.getItem("rubus-local-config-lang")) {
      $_rubusDocConfig.lang = window.localStorage.getItem("rubus-local-config-lang");
    } else {
      window.localStorage.setItem("rubus-local-config-lang", $_rubusDocConfig.lang);
    }
  });
</script>

<style>
  main {
    margin-top: 100px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: flex-start;
  }
</style>

<Cornerstone spectrumTheme={$_rubusDocConfig.theme}>
  <Nav {segment} />
  <main>
    <slot />
  </main>
</Cornerstone>
