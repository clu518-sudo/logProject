<script>
  import { page } from "$app/stores";
  import ArticleEditor from "$lib/pages/ArticleEditor.svelte";

  // Reactive route parameter for the editor id.
  $: id = $page.params.id;
</script>

<ArticleEditor {id} />

