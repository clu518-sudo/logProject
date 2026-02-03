<script>
  import Editor from "@tinymce/tinymce-svelte";

  let conf = {
    height: 500,
    menubar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "preview",
      "help",
      "wordcount"
    ],
    toolbar:
      "undo redo | blocks | " +
      "bold italic forecolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "image | removeformat | help",
    file_picker_types: "image",
    file_picker_callback: (callback, value, meta) => {
      if (meta.filetype !== "image") return;

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          callback(reader.result, { alt: file.name });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };

  export let value = "";

  // Works in SvelteKit because it still uses Vite env vars in the browser bundle.
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key";
</script>

<main class="tinymce-wrapper">
  <Editor apiKey={apiKey} bind:value={value} {conf} />
</main>

<style>
  .tinymce-wrapper :global(.tox) {
    border-radius: 8px;
  }
</style>

