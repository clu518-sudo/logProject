<script>
  import { page } from "$app/stores";
  import ArticleDetail from "$lib/pages/ArticleDetail.svelte";

  // Reactive route parameter for the article id.
  $: id = $page.params.id;
</script>

<ArticleDetail {id} />

