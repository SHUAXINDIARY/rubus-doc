<script>
  import { onMount } from "svelte";
  export let language;
  export let code;

  onMount(() => {
    import("./prismjs.js");
  });
</script>

<pre class="line-numbers"><code class="language-{language}">{code}</code></pre>
