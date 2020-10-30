<script>
  import * as router from "./nav.json";

  import { Picker, MenuItem } from "@rubus/rubus/src";

  import { beforeUpdate, getContext } from "svelte";

  export let segment = "";

  let rubusDocConfig = getContext("rubusDocConfig");
  let themeList = ["light", "lightest", "dark", "darkest"];
  let languageList = [
    { name: "中文", code: "zh" },
    { name: "English", code: "en" },
  ];

  let resultLanguageIndex = 0;
  let resultThemeIndex = 0;

  function switchTheme(t) {
    $rubusDocConfig.theme = t;
    window.localStorage.setItem("rubus-local-config-theme", t);
  }

  function switchLanguage(l) {
    $rubusDocConfig.lang = l;
    window.localStorage.setItem("rubus-local-config-lang", l);
  }

  beforeUpdate(() => {
    for (let index = 0; index < themeList.length; index++) {
      if (themeList[index] === $rubusDocConfig.theme) {
        resultThemeIndex = index;
      }
    }
    for (let index = 0; index < languageList.length; index++) {
      if (languageList[index].code === $rubusDocConfig.lang) {
        resultLanguageIndex = index;
      }
    }
  });
</script>

<style>
  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    background-color: var(--spectrum-global-color-gray-50);
    display: flex;
    justify-content: center;
    z-index: 99;
  }
  ul {
    margin: 0;
    padding: 0;
  }
  li {
    list-style-type: none;
  }
  a,
  a:hover,
  a:focus,
  a:active {
    text-decoration: none;
    color: inherit;
  }
  .nav-wrap {
    width: 98%;
    height: 60px;

    display: flex;
    justify-content: space-between;
  }
  .nav-item {
    height: 60px;
  }
  .nav-logo {
    display: flex;
    align-items: center;
  }

  img {
    height: 40px;
  }

  .router-wrap {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .route-item {
    text-align: center;

    width: 120px;
    line-height: 60px;
    height: 100%;
    position: relative;
  }
  .current-route {
    color: var(--spectrum-semantic-cta-color-background-default);
  }

  span {
    position: absolute;
    bottom: 0;
    background: var(--spectrum-semantic-cta-color-background-default);
    left: 45px;
    width: 30px;
    height: 4.5px;
    border-top-left-radius: 4.5px;
    border-top-right-radius: 4.5px;
  }
  .nav-menu-area {
    display: flex;
    justify-content: space-between;
  }
  .theme-list {
    display: flex;
    align-items: center;
    height: 60px;
  }
  .language-list {
    display: flex;
    width: 140px;
    height: 60px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
</style>

<nav>
  <ul class="nav-wrap">
    <li class="nav-item nav-logo">
      <a href="./">
        <img
          src="logo-{$rubusDocConfig.theme == 'light' || $rubusDocConfig.theme == 'lightest' ? 'light' : 'dark'}.png"
          alt="logo" />
      </a>
    </li>
    <li class="nav-item">
      <ul class="router-wrap">
        {#each router[$rubusDocConfig.lang] as route, i}
          <li
            class="route-item"
            class:current-route={route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}>
            <a href={route.url}>{route.name}
              {#if route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}
                <span />
              {/if}</a>
          </li>
        {/each}
      </ul>
    </li>
    <li class="nav-item nav-menu-area">
      <div class="theme-list">
        <Picker
          placeholder={$rubusDocConfig.theme.replace(/^\S/, (s) => s.toUpperCase())}
          isQuiet
          minWidth="80"
          resultIndex={resultThemeIndex}>
          {#each themeList as item, index}
            <MenuItem
              thisIndex={index}
              label={item.replace(/^\S/, (s) => s.toUpperCase())}
              resultIndex={resultThemeIndex}
              on:click={() => {
                switchTheme(item);
              }} />
          {/each}
        </Picker>
      </div>
      <div class="language-list">
        <Picker placeholder="Language" isQuiet minWidth="80" resultIndex={resultLanguageIndex}>
          {#each languageList as lang, i}
            <MenuItem
              thisIndex={i}
              label={lang.name}
              resultIndex={resultLanguageIndex}
              isSelected={i === resultLanguageIndex}
              on:click={() => {
                switchLanguage(lang.code);
              }} />
          {/each}
        </Picker>
      </div>
    </li>
  </ul>
</nav>
