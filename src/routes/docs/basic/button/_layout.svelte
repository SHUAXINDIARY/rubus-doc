<script>
  import { TypographyHeading, Flex, TypographyBody, Tab, Tabs } from "@rubus/rubus/src";
  import { onMount, getContext } from "svelte";
  import { stores } from "@sapper/app";
  const { page } = stores();
  let rubusDocConfig = getContext("rubusDocConfig");
  export let segment;
  segment;

  let tabList = [
    { name: "用法", url: "docs/basic/button/usage" },
    { name: "Props", url: "docs/basic/button/props" },
    { name: "用例", url: "docs/basic/button/examples" },
    { name: "问题", url: "docs/basic/button/issues" },
  ];
  let currentTabIndex = 0;

  function tabCurrentTabIndex() {
    for (let index = 0; index < tabList.length; index++) {
      if ($page.path.substr(1) == tabList[index].url) {
        currentTabIndex = index;
      }
    }
  }

  onMount(() => {
    tabCurrentTabIndex();
  });
</script>

<style>
  header {
    min-height: 150px;
  }
  main {
    margin: 35px 0;
  }
</style>

<svelte:head>
  <title>{$rubusDocConfig.name} Button</title>
</svelte:head>

<header>
  <TypographyHeading scale="XL">Button</TypographyHeading>
  <Flex spacing={{ height: 'size-600' }} alignItems="center">
    <TypographyBody scale="M">常规按钮组件，一般用于给定用户操作提供选项</TypographyBody>
  </Flex>
</header>
<nav>
  <Tabs>
    {#each tabList as tab, i}
      <Tab
        selfIndex={i}
        {currentTabIndex}
        href={tab.url}
        on:click={() => {
          currentTabIndex = i;
        }}>
        {tab.name}
      </Tab>
    {/each}
  </Tabs>
</nav>

<main>
  <slot />
</main>
