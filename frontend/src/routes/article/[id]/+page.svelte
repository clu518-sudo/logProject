<script>
  import { page } from "$app/stores";
  import ArticleDetail from "$lib/pages/ArticleDetail.svelte";

  $: id = $page.params.id;
</script>

<ArticleDetail {id} />

