import fs from "fs";
import path from "path";

// DashScope image generation API configuration
// - Singapore: https://dashscope-intl.aliyuncs.com/api/v1
// - US (Virginia): https://dashscope-us.aliyuncs.com/api/v1
// - China (Beijing): https://dashscope.aliyuncs.com/api/v1
const DASHSCOPE_API_KEY =
  process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
const DASHSCOPE_IMAGE_URL =
  "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

/**
 * Generate Image using DashScope Qwen Image API
 * @param {string} prompt - Image description
 * @param {string} size - Image size ('1024*1024', '720*1280', '1280*720')
 * @param {Object} options - Optional generation settings
 * @returns {Promise<string>} - URL of the generated image
 * Note: DashScope uses 'qwen-image' or 'qwen-image-plus' for image generation
 */
export async function generateImage(prompt, size = "1024*1024", options = {}) {
  try {
    if (!DASHSCOPE_API_KEY) {
      throw new Error(
        "Missing DASHSCOPE_API_KEY or OPENAI_API_KEY environment variable."
      );
    }

    const {
      model = "qwen-image-plus",
      negativePrompt = " ",
      promptExtend = true,
      watermark = false,
      n = 1,
    } = options;

    const response = await fetch(DASHSCOPE_IMAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: model,
        input: {
          prompt: prompt,
          negative_prompt: negativePrompt,
        },
        parameters: {
          size: size,
          n: n,
          prompt_extend: promptExtend,
          watermark: watermark,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.output && data.output.task_status === "SUCCEEDED") {
      return data.output.results[0].url;
    }
    if (data.output && data.output.task_id) {
      return await pollImageResult(data.output.task_id);
    }

    throw new Error("Unexpected response format from DashScope");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Poll for image generation result
 * @param {string} taskId - The task ID from initial request
 * @param {number} maxAttempts - Max polling attempts
 * @param {number} delayMs - Delay between polls in ms
 * @returns {Promise<string>} - URL of the generated image
 */
async function pollImageResult(taskId, maxAttempts = 30, delayMs = 2000) {
  const pollUrl = `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`;

  for (let i = 0; i < maxAttempts; i += 1) {
    const response = await fetch(pollUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Poll failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.output && data.output.task_status === "SUCCEEDED") {
      return data.output.results[0].url;
    }
    if (data.output && data.output.task_status === "FAILED") {
      throw new Error(
        `Image generation failed: ${data.output.message || "Unknown error"}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Image generation timed out");
}

/**
 * Download and save image from URL to local folder
 * @param {string} imageUrl - URL of the image to download
 * @param {string} folderPath - Optional folder path (defaults to './generated_images')
 * @param {string} filename - Optional custom filename (defaults to timestamp)
 * @returns {Promise<string>} - Path to the saved image file
 */
export async function saveImageFromUrl(
  imageUrl,
  folderPath = "./generated_images",
  filename = null
) {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = new Date().getTime();
    const extension = ".png";
    const finalFilename = filename || `image_${timestamp}${extension}`;
    const filePath = path.join(folderPath, finalFilename);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`Image saved to: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error saving image:", error);
    throw error;
  }
}

/**
 * Generate and Save Image - Combined function
 * @param {string} prompt - Image description
 * @param {string} size - Image size ('1024*1024', '720*1280', '1280*720')
 * @param {Object} options - Optional generation settings
 * @param {string} folderPath - Optional folder path
 * @param {string} filename - Optional custom filename
 * @returns {Promise<Object>} - Object containing imageUrl and savedPath
 */
export async function generateAndSaveImage(
  prompt,
  size = "1024*1024",
  folderPath = "./generated_images",
  filename = null,
  options = {}
) {
  try {
    const imageUrl = await generateImage(prompt, size, options);
    const savedPath = await saveImageFromUrl(imageUrl, folderPath, filename);

    return {
      imageUrl,
      savedPath,
      prompt,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in generateAndSaveImage:", error);
    throw error;
  }
}

// Example usage:
/*
// Generate image and get URL only
const imageUrl = await generateImage("A cute cat wearing a hat", "1664*928", {
  model: "qwen-image-plus",
  negativePrompt: " ",
  promptExtend: true,
  watermark: false,
});
console.log(imageUrl);

// Generate image and save locally
const result = await generateAndSaveImage(
  "A beautiful sunset over mountains",
  "1024*1024"
);
console.log("Image URL:", result.imageUrl);
console.log("Saved to:", result.savedPath);

// Save image with custom path and filename
const customResult = await generateAndSaveImage(
  "A futuristic city",
  "1024*1024",
  "./my_images",
  "futuristic_city.png"
);

// Or download an existing image URL
const savedPath = await saveImageFromUrl(imageUrl, "./downloads", "my_image.png");
*/
