<script>
  import { TypographyHeading } from "@rubus/rubus/src";
  import { getContext } from "svelte";

  let rubusDocConfig = getContext("rubusDocConfig");
</script>

<svelte:head>
  <title>{$rubusDocConfig.name} 颜色</title>
</svelte:head>
<TypographyHeading scale="XL">颜色</TypographyHeading>
