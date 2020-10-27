<script>
  import { SideNav, SideNavGroup, SideNavItem } from "@rubus/rubus/src";
  import { stores } from "@sapper/app";
  const { page } = stores();

  let routers = [
    {
      title: "Token",
      router: [
        { url: "./docs/csstokens/color", name: "颜色" },
        { url: "csstokens", name: "尺寸" },
      ],
    },
    {
      title: "Asset",
      router: [
        { url: "Token", name: "图标" },
        { url: "Token", name: "插画" },
      ],
    },
    {
      title: "Basic",
      router: [
        { url: "Token", name: "Button 按钮" },
        { url: "Token", name: "Link 链接" },
      ],
    },
  ];
</script>

<style>
  nav {
    width: 200px;
    height: 100vh;
  }
</style>

<nav>
  <SideNav>
    {#each routers as item, i}
      <SideNavGroup title={item.title}>
        {#each item.router as _router}
          <SideNavItem href={_router.url} isSelected={_router.url.indexOf($page.path) > -1}>{_router.name}</SideNavItem>
        {/each}
      </SideNavGroup>
    {/each}
  </SideNav>
</nav>
