<script>
  import { Radio, Checkbox, Tooltip, Toast } from "@rubus/rubus/src";
  import { getContext, onMount } from "svelte";

  import * as colorData from "./color.json";

  let colorModel = "hex";
  let staticColorsView = false;
  let rubusDocConfig = getContext("rubusDocConfig");
  let colorDisplay = "globalColor";

  onMount(() => {});
  function handleClick() {
    staticColorsView = !staticColorsView;
    colorDisplay = staticColorsView ? "staticColor" : "globalColor";
  }

  async function copyColor(t, c) {
    if (colorModel !== "hex") {
      c = hexToRGB(c);
    }
    let colorCode = staticColorsView
      ? `--spectrum-global-color-static-${t.replace(/[^a-zA-Z]/gi, "").toLowerCase()}-${t.replace(
          /[^0-9]/gi,
          ""
        )}: ${c}`
      : `--spectrum-global-color-${t.replace(/[^a-zA-Z]/gi, "").toLowerCase()}-${t.replace(/[^0-9]/gi, "")}: ${c}`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(colorCode);
        console.log("Page URL copied to clipboard:" + colorCode);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  }
  function hexToRGB(h) {
    let r = 0,
      g = 0,
      b = 0;

    // 3 digits
    if (h.length == 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];

      // 6 digits
    } else if (h.length == 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }

    return "rgb(" + +r + "," + +g + "," + +b + ")";
  }

  function hexToHSL(H) {
    let r = 0,
      g = 0,
      b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
  }

  function lightAndDark(code) {
    let [, , l] = hexToHSL(code);
    let crossover = 50;
    switch ($rubusDocConfig.theme) {
      case "light":
        crossover = 60;
        break;
      case "lightest":
        crossover = 70;
        break;
      case "dark":
        crossover = 38;
        break;
      case "darkest":
        crossover = 35;
        break;
    }
    return l >= crossover ? false : true;
  }
</script>

<style>
  .toolbar {
    display: flex;
    width: 300px;
    justify-content: space-between;
    align-items: center;
  }
  form {
    display: flex;
  }
  .vertical-line {
    width: 1px;
    height: 20px;
    background-color: var(--spectrum-alias-background-color-default);
  }
  .color-model {
    width: 120px;
    justify-content: space-between;
  }
  .color-container {
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 4px;
    padding-top: 32px;
    background-color: var(--spectrum-global-color-gray-100);
    border: 1px solid var(--spectrum-global-color-gray-300);
    border-radius: 4px;
  }
  .color-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    max-width: 816px;
    margin: auto;
    margin-bottom: 30px;
  }
  .color-item {
    flex-basis: 22%;
    height: 100px;
    margin: 1.5%;
    border-radius: 4px;

    box-sizing: border-box;
    cursor: pointer;
    padding: 10px;
    border: 1px solid var(--spectrum-global-color-gray-200);
    transition: transform 130ms ease-in-out;
  }
  .color-item:hover {
    transform: scale(1.08);
  }
  .color-item-name {
    font-size: 11px;
    line-height: 1.3;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 0;
  }
  .color-item-code {
    font-weight: 600;
    line-height: 1.3;
    font-size: 13px;
  }
  .color-item-light > .color-item-name {
    color: var(--spectrum-global-color-static-gray-800);
  }
  .color-item-light > .color-item-code {
    color: var(--spectrum-global-color-static-gray-900);
  }
  .color-item-dark > .color-item-name {
    color: var(--spectrum-global-color-static-gray-200);
  }
  .color-item-dark > .color-item-code {
    color: var(--spectrum-global-color-static-gray-100);
  }
</style>

<div class="toolbar">
  <form>
    <Checkbox checked={staticColorsView} on:click={handleClick}>Static colors</Checkbox>
  </form>
  <div class="vertical-line" />
  <form class="color-model">
    <Radio
      value="Hex"
      checked={colorModel == 'hex'}
      on:click={() => {
        colorModel = 'hex';
      }} />
    <Radio
      value="RGB"
      checked={colorModel == 'rgb'}
      on:click={() => {
        colorModel = 'rgb';
      }} />
  </form>
</div>
<div class="color-container">
  {#each colorData[$rubusDocConfig.theme][colorDisplay] as items}
    <div class="color-group">
      {#each items as colorItem}
        <div
          on:click={() => {
            copyColor(colorItem.name, colorItem.code);
          }}
          class="color-item {lightAndDark(colorItem.code) ? 'color-item-dark' : 'color-item-light'}"
          style={`background-color:${colorModel == 'hex' ? colorItem.code.toUpperCase() : hexToRGB(colorItem.code).toUpperCase()}`}>
          <div class="color-item-name">{colorItem.name}</div>
          <div class="color-item-code">
            {colorModel == 'hex' ? colorItem.code.toUpperCase() : hexToRGB(colorItem.code).toUpperCase()}
            <Tooltip width="size-600" directions="bottom" label="复制" />
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
<Toast label="复制成功" variants="success" />
