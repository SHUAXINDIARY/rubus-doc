<script>
  import Code from "../components/code/Code.svelte";
  let code_sample = `var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);
`;
</script>

<Code language="javascript" code={code_sample} />
