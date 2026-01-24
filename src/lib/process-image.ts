// Background removal using @imgly/background-removal
import { removeBackground } from "@imgly/background-removal";

/**
 * Process an image by removing its background
 * @param imageUrl - URL or blob URL of the image to process
 * @returns Data URL of the processed image with background removed
 */
export async function processImage(imageUrl: string): Promise<string> {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Remove background using imgly
    const resultBlob = await removeBackground(blob, {
      model: "isnet_quint8",
      output: {
        format: "image/png",
        quality: 1,
      },
    });

    // Convert result blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read result as data URL"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(resultBlob);
    });
  } catch (error) {
    console.error("Background removal failed:", error);
    throw error;
  }
}
