import { NextRequest, NextResponse } from "next/server";
import { analyzeStory } from "@/lib/storyAnalyzer";

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json();

    if (!story || typeof story !== "string" || story.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid story with at least 10 characters." },
        { status: 400 }
      );
    }

    // Analyze the story to extract key scenes
    const scenes = await analyzeStory(story.trim());

    if (!scenes || scenes.length === 0) {
      return NextResponse.json(
        { error: "Unable to analyze the story. Please try a different story." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      scenes,
      count: scenes.length,
      message: `Found ${scenes.length} scenes perfect for illustration!`
    });

  } catch (error) {
    console.error("Story analysis error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to analyze your story. Please try again with a different story.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}