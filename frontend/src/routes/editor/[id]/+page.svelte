<script>
  import { page } from "$app/stores";
  import ArticleEditor from "$lib/pages/ArticleEditor.svelte";

  $: id = $page.params.id;
</script>

<ArticleEditor {id} />

