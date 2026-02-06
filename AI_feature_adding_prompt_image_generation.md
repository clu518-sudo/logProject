# AI-Generated Blog Header Images Feature

## Goal

Add automatic AI-generated header images for blog posts when users don't upload one themselves.

## Context

- **Backend image generation service:** `backend/src/services/image_generation.js` with `generateAndSaveImage()` function
- **Backend text generation service:** `backend/src/services/text_generation.js` with `chatCompletion()` function
- **Blog creation endpoint:** `POST /api/articles` in `backend/src/routes/articles.js`
- **Frontend editor:** `frontend/src/lib/pages/ArticleEditor.svelte` which handles blog creation

## Requirements

1. **Auto-generate header images:** When a user creates a new blog post without uploading a header image, automatically generate one using AI
2. **Smart prompt generation:** Use the blog title and content to create a relevant image prompt via text generation AI
3. **Image generation:** Generate the image using the existing image generation service
4. **Save to proper location:** Save the generated image to `backend/uploads/header-images` folder (same location as user-uploaded header images)
5. **Attach to article:** Associate the generated image path with the article record
6. **Loading indicator:** Display a loading state with text "AI generating..." while the image is being created in the background
7. **User override:** Allow users to replace AI-generated images with their own uploads later

## Implementation Steps

### Backend Changes

1. **Modify `POST /articles` endpoint** (`backend/src/routes/articles.js`)

   - Detect when no header image is provided during article creation
   - After creating the article record, trigger AI image generation
   - Update the article with the generated image path

2. **Create image prompt generator helper function**

   - Create a new function that takes article title and content
   - Use `chatCompletion()` to generate a concise, descriptive image prompt
   - System prompt should instruct AI to create prompts suitable for image generation
   - Keep prompts focused, descriptive, and visually concrete

3. **Integrate image generation**

   - Call `generateAndSaveImage()` with the AI-generated prompt
   - **IMPORTANT:** Save to `backend/uploads/header-images` folder (same location as user-uploaded header images)
   - Use appropriate naming convention (e.g., `ai_generated_${articleId}_${timestamp}.png`)
   - Handle the async nature of image generation

4. **Add metadata tracking**
   - Consider adding a field to track if image is AI-generated vs user-uploaded
   - This could be a new database column or stored in article metadata

### Frontend Changes

1. **Update `ArticleEditor.svelte`**

   - Show loading state with text "AI generating..." during image creation
   - Display the loading indicator in the header image area
   - Allow easy replacement of AI-generated images once complete

2. **Optional: Add generation trigger button**
   - Add a button to manually trigger AI image generation
   - Useful if user wants to regenerate with different content

### Database Changes (if needed)

- Add `is_ai_generated_image` boolean field to articles table
- Or add `image_metadata` JSON field for extensibility

## File Storage Structure

**IMPORTANT:** All AI-generated header images must be saved to the same folder as user-uploaded header images:

```
backend/uploads/header-images/
├── user_uploaded_image_1.png
├── user_uploaded_image_2.jpg
├── ai_generated_123_1738742400000.png  ← AI-generated images here
└── ai_generated_456_1738742500000.png
```

- **Folder path:** `backend/uploads/header-images`
- **Naming convention:** `ai_generated_${articleId}_${timestamp}.png`
- **Storage format:** PNG (consistent with DashScope output)
- **Database path:** Store relative path like `/uploads/header-images/ai_generated_123_1738742400000.png`

This ensures:
- Consistent serving/access patterns
- Proper static file middleware handling
- Easy backup and migration
- Same permission/security model as user uploads

## Technical Considerations

### Error Handling

- If AI generation fails, allow the post to be created without an image
- Log errors for debugging
- Show user-friendly error messages
- Don't block article creation due to image generation failures

### Performance

- Make AI generation asynchronous (don't block article creation)
- Consider background job processing for large-scale deployments
- Add timeout limits for AI API calls

### User Experience & Loading State

- Display "AI generating..." text with a spinner/loading animation in the header image area
- Provide clear feedback about the generation progress
- Keep the user on the page until generation completes (or redirect after starting background job)
- Allow users to navigate away if generation is taking too long
- Consider showing estimated time (e.g., "AI generating... (usually takes 10-30 seconds)")
- On failure, show a retry button or option to upload manually

### Configuration

- Make AI generation optional via environment variable (e.g., `ENABLE_AI_HEADER_GENERATION=true`)
- Allow configuration of default image size for headers
- Consider adding prompt template customization
- **Folder Path:** Ensure AI-generated images are saved to `backend/uploads/header-images` to maintain consistency with user uploads

### Rate Limiting

- Monitor AI API usage to avoid excessive costs
- Consider implementing rate limits per user
- Cache generated images to avoid regenerating similar content

### Cost Optimization

- Only generate images for published articles (skip drafts)
- Or allow user to opt-in/opt-out of AI generation
- Implement prompt caching if available

## Example Implementation Flow

```javascript
// In POST /articles endpoint
1. Create article record (without header image)
2. If no header image uploaded AND AI generation enabled:
   a. Generate image prompt from title + content snippet
   b. Generate image using prompt
   c. Save image to backend/uploads/header-images folder
   d. Update article with relative image path (e.g., "/uploads/header-images/ai_generated_123_1234567890.png")
3. Return article to frontend

// Prompt generation example
Input: { title: "Top 10 Travel Tips for Europe", content: "..." }
Output: "A vibrant collage of European landmarks including the Eiffel Tower, 
         Colosseum, and Amsterdam canals, travel-themed flat design, colorful 
         and modern illustration style"

// Example function call with correct folder path
const result = await generateAndSaveImage(
  imagePrompt,
  "1024*1024",
  "./uploads/header-images",  // ← IMPORTANT: Save to same folder as user uploads
  `ai_generated_${articleId}_${Date.now()}.png`
);

// Update article with the generated image path
const relativePath = result.savedPath.replace(/^.*\/uploads/, '/uploads');
await updateHeaderImage(articleId, relativePath);

// Frontend loading state implementation
// 1. When user clicks "Save" without header image:
//    - Show "AI generating..." text/spinner in header image area
//    - Disable save button or show progress indicator
// 2. After article is created and image generation starts:
//    - Keep showing "AI generating..." while polling/waiting
// 3. Once image is generated and article updated:
//    - Replace loading state with the generated image
//    - Enable all editing functionality
// 4. If generation fails:
//    - Show error message
//    - Allow user to upload manually or retry
```

## Testing Checklist

- [ ] Article creation without header image triggers AI generation
- [ ] Article creation with header image skips AI generation
- [ ] Generated images are properly sized and formatted
- [ ] Images are saved to correct folder with proper permissions
- [ ] Article record is updated with image path
- [ ] Frontend displays "AI generating..." loading state during image creation
- [ ] Users can replace AI-generated images
- [ ] Error handling works when AI services fail
- [ ] Rate limiting prevents excessive API calls
- [ ] Environment variable toggle works correctly

## Future Enhancements

- Allow users to provide custom prompts for image generation
- Offer multiple AI-generated options for users to choose from
- Implement image style preferences (realistic, cartoon, abstract, etc.)
- Add regeneration history/variants
- Integrate DALL-E, Stable Diffusion, or other image generation models
- A/B testing to see if AI images improve engagement

---

**Ready to implement?** Share this prompt with your AI coding assistant or development team to add this feature to your blog platform!
