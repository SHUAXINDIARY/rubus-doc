<script>
  import { NavMenu } from "../../components";

  export let segment;
  segment;
</script>

<style>
  .content {
    width: 1000px;

    display: block;
    margin-top: var(--spectrum-sidenav-heading-gap-top, var(--spectrum-global-dimension-size-200));
    margin-bottom: var(--spectrum-global-dimension-size-800);
    padding-left: var(--spectrum-global-dimension-size-800);
  }
</style>

<NavMenu />
<div class="content">
  <slot />
</div>
