import { NextRequest, NextResponse } from "next/server";
import { StoryScene, generateImage } from "@/lib/aiConfig";
import { createChildFriendlyPrompt } from "@/lib/storyAnalyzer";

export async function POST(request: NextRequest) {
  try {
    const { scenes } = await request.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: "No scenes provided for image generation." },
        { status: 400 }
      );
    }

    // Generate images for each scene in parallel
    const imagePromises = scenes.map(async (scene: StoryScene, index: number) => {
      try {
        const childFriendlyPrompt = createChildFriendlyPrompt(scene);
        const imageUrl = await generateImage(childFriendlyPrompt);
        
        return {
          id: scene.id,
          url: imageUrl,
          description: scene.description,
          sceneTitle: scene.title,
          order: scene.order || index + 1
        };
      } catch (error) {
        console.error(`Failed to generate image for scene ${scene.id}:`, error);
        
        // Return placeholder image as fallback
        return {
          id: scene.id,
          url: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/332d7794-c6e4-4e82-a347-0e867c46aa7c.png + " - " + scene.description.slice(0, 50))}`,
          description: scene.description,
          sceneTitle: scene.title,
          order: scene.order || index + 1
        };
      }
    });

    const images = await Promise.all(imagePromises);

    // Sort images by order
    images.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      images,
      count: images.length,
      message: `Generated ${images.length} beautiful images for your story!`
    });

  } catch (error) {
    console.error("Image generation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate images for your story. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Add timeout for long-running image generation
export const maxDuration = 60; // 60 seconds timeout