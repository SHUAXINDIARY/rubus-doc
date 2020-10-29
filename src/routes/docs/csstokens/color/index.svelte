<script>
  import { TypographyHeading, TypographyBody } from "@rubus/rubus/src";
  import { getContext } from "svelte";
  import ColorContainer from "../../../../components/color-container";
  let rubusDocConfig = getContext("rubusDocConfig");
</script>

<style>
  header {
    min-height: 120px;
  }
</style>

<svelte:head>
  <title>{$rubusDocConfig.name} 颜色</title>
</svelte:head>

<header>
  <TypographyHeading scale="XL">颜色</TypographyHeading>
  <TypographyBody scale="M" lineHeight="size-400">位于设计系统中的颜色令牌</TypographyBody>
</header>

<main>
  <ColorContainer />
</main>
