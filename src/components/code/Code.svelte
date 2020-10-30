<script>
  import { onMount } from "svelte";
  export let language;
  export let code;

  onMount(() => {
    import("./prismjs.js");
  });
</script>

<style>
  pre {
    max-height: 400px;
    margin: 0;
  }
</style>

<pre class="line-numbers"><code class="language-{language}">{code}</code></pre>
