"use server";

import { revalidatePath } from "next/cache";

/**
 * This is a placeholder server action for image upload.
 * Since we're storing images in browser storage as per requirements,
 * this is not actively used in this version of the app.
 * It could be expanded for server-side storage in the future.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadImage(formData: FormData) {
  try {
    // In a real implementation, we would handle file upload here
    // For now, we're just simulating a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Revalidate the current page
    revalidatePath("/");
    
    // Return a mock response
    return { 
      success: true, 
      imageUrl: "mock-image-url",
      message: "Image uploaded successfully" 
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { 
      success: false, 
      message: "Failed to upload image" 
    };
  }
} 