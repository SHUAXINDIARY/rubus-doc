<script>
  import { TypographyHeading, TypographyBody, Button } from "@rubus/rubus/src";
  import { Showcase } from "../../../../../components";
  let previewCode = `\<script\>
  import { Button } from "@rubus/rubus"; 
 \</script\>

  <Button>Start</Button>`;
</script>

<style>
  .section-title {
    margin: 16px 0;
  }
</style>

<div class="section-title">
  <TypographyHeading>速览</TypographyHeading>
  <TypographyBody />
</div>

<Showcase code={previewCode}>
  <Button>Start</Button>
</Showcase>
