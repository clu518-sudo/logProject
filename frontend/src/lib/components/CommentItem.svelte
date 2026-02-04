<script>
  import { me } from "$lib/store.js";
  export let comment;
  export let onReply;
  export let onDelete;

  // Reactive avatar URL for the comment author.
  $: avatarUrl = `/api/users/${comment.authorUserId}/avatar`;
</script>

<div class="comment" style="margin-top: 12px;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div style="display: flex; gap: 10px; align-items: flex-start;">
      <img src={avatarUrl} alt="{comment.author.username}'s avatar" class="comment-avatar" />
      <div>
        <div>
          <strong>{comment.author.username}</strong>
          <span class="muted"> · {new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        <div style="margin: 8px 0;">{comment.content}</div>
        {#if $me}
          <button class="btn secondary" on:click={() => onReply(comment)} style="margin-top: 4px;">Reply</button>
        {/if}
      </div>
    </div>
    {#if comment.canDelete}
      <button class="btn danger" on:click={() => onDelete(comment)}>Delete</button>
    {/if}
  </div>
  {#if comment.children?.length}
    {#each comment.children as child}
      <svelte:self comment={child} {onReply} {onDelete} />
    {/each}
  {/if}
</div>

<style>
  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #132860;
    flex-shrink: 0;
  }
</style>

