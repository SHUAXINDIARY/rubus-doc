<script>
  import * as icons from "@rubus/svelte-spectrum-icons-ui";
  import * as workflowIcons from "@rubus/svelte-spectrum-icons-workflow";
  import { TypographyHeading, TypographyBody, Button, ButtonIconWrap } from "@rubus/rubus/src";
  import { onMount, getContext } from "svelte";
  let rubusDocConfig = getContext("rubusDocConfig");
  let iconList = [];
  let isSelectedIndex = 0;
  onMount(async () => {
    await Object.keys(icons).forEach(function (key, index) {
      iconList[index] = key;
    });
  });

  async function copyIconName(n) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(n);
        console.log("Page URL copied to clipboard!" + n);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  }
</script>

<style>
  .iconGrid {
    border: 1px solid var(--spectrum-global-color-gray-300);
    border-radius: 4px;
    margin: var(--spectrum-global-dimension-static-size-200) 0;
    min-height: var(--spectrum-global-dimension-static-size-6000);
    padding: var(--spectrum-global-dimension-static-size-400) var(--spectrum-global-dimension-static-size-500);
  }
  .iconContainer {
    display: grid;
    justify-items: center;
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: auto;
    grid-gap: var(--spectrum-global-dimension-static-size-200);
    list-style: none;
    margin: 0;
    margin-top: var(--spectrum-global-dimension-static-size-400);
    padding: 0;
    text-align: center;
  }
  .iconContainer > li {
    display: flex;
    height: 125px;
    flex-flow: column nowrap;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .icon-item {
    height: 100%;
    padding-top: var(--spectrum-global-dimension-static-size-200);
    padding-bottom: var(--spectrum-global-dimension-static-size-200);
    position: relative;
    transition: border-color var(--spectrum-global-animation-duration-100) ease-in-out,
      box-shadow var(--spectrum-global-animation-duration-100) ease-in-out;
    outline: none;
    box-sizing: border-box;
    border-radius: 4px;
    border: 2px solid rgba(255, 255, 255, 0);
    cursor: pointer;
  }
  .icon-item-active {
    border: 2px solid var(--spectrum-semantic-cta-color-background-default);
  }
  .icon-item span {
    align-items: center;
    display: flex;
    height: var(--spectrum-global-dimension-static-size-500);
    justify-content: center;
    margin: 0;
  }
  .icon-name {
    font-size: 10px;
    line-height: 10px;
  }
</style>

<svelte:head>
  <title>{$rubusDocConfig.name} 图标</title>
</svelte:head>

<header>
  <TypographyHeading scale="XL">图标</TypographyHeading>
  <TypographyBody scale="M">位于设计系统中的颜色令牌</TypographyBody>
</header>
<div class="iconGrid">
  <ul class="iconContainer showSizeDesktop___3TMRI">
    {#each iconList as icon, i}
      <li
        on:click={() => {
          isSelectedIndex = i;
        }}>
        <div class="icon-item" class:icon-item-active={isSelectedIndex === i} tabindex="0" role="menu">
          <span>
            <svelte:component this={icons[icon]} width="20" height="20" scale="L" />
          </span>
          <p class="icon-name">{icon.replace('Icon', '')}</p>
          {#if isSelectedIndex === i}
            <Button
              exterior="action"
              isQuiet
              on:click={() => {
                copyIconName(icon);
              }}>
              <ButtonIconWrap onlyIcon>
                <svelte:component this={workflowIcons.IconPasteText} />
              </ButtonIconWrap>
            </Button>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>
