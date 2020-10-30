<script>
  import { ActionGroup, Button, ButtonIconWrap } from "@rubus/rubus/src";
  import { IconSelection, IconTransparency, IconLoupeView, IconCopy } from "@rubus/svelte-spectrum-icons-workflow";
  import Code from "../code";

  let showWay = "light-scene";

  export let language = "js";
  export let code = "";

  async function copyCode(t, c) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(code);
        console.log("Page URL copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  }
</script>

<style>
  .showcase {
    padding: 1em;
    display: flex;
    margin: 0.5em 0;
    overflow: auto;
    border-radius: 0.3em;
  }
  .transparency {
    background-image: linear-gradient(45deg, var(--spectrum-global-color-gray-300) 25%, transparent 25%),
      linear-gradient(135deg, var(--spectrum-global-color-gray-300) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--spectrum-global-color-gray-300) 75%),
      linear-gradient(135deg, transparent 75%, var(--spectrum-global-color-gray-300) 75%);
    background-size: 20px 20px;
    background-position: 0px 0px, 10px 0px, 10px -10px, 0px 10px;
  }
  .showcase-wrap {
    height: auto;
    border: 1px solid var(--spectrum-global-color-gray-200);
    padding: 10px 10px 10px 20px;
    border-radius: 0.3em;
  }

  .showcase-toolbar {
    display: flex;
    width: 100%;
    margin-bottom: 10px;
    justify-content: space-between;
  }
  .button-group {
    display: flex;
  }
  .light-scene {
    background-color: var(--spectrum-global-color-static-gray-75);
  }
  .dark-scene {
    background-color: var(--spectrum-global-color-static-gray-900);
  }
</style>

<div class="showcase-wrap">
  <div class="showcase-toolbar">
    <div class="button-group">
      <ActionGroup isCompact onlyIcon>
        <Button
          exterior="action"
          isQuiet
          isSelected={showWay === 'light-scene'}
          on:click={() => {
            showWay = 'light-scene';
          }}>
          <IconSelection />
        </Button>
        <Button
          exterior="action"
          isQuiet
          isSelected={showWay === 'dark-scene'}
          on:click={() => {
            showWay = 'dark-scene';
          }}>
          <IconLoupeView />
        </Button>
        <Button
          exterior="action"
          isQuiet
          isSelected={showWay === 'transparency-scene'}
          on:click={() => {
            showWay = 'transparency-scene';
          }}>
          <IconTransparency />
        </Button>
      </ActionGroup>
    </div>
    <div class="button-group">
      <Button exterior="action" on:click={copyCode} isQuiet>
        <ButtonIconWrap onlyIcon>
          <IconCopy />
        </ButtonIconWrap>
      </Button>
    </div>
  </div>
  <div
    class="showcase"
    class:light-scene={showWay === 'light-scene'}
    class:dark-scene={showWay === 'dark-scene'}
    class:transparency={showWay === 'transparency-scene'}>
    <slot />
  </div>
  <Code {language} {code} />
</div>
