"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Download, BookOpen } from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  description: string;
  sceneTitle: string;
}

interface GenerationProgress {
  step: string;
  progress: number;
  isComplete: boolean;
}

export default function HomePage() {
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progress, setProgress] = useState<GenerationProgress>({
    step: "",
    progress: 0,
    isComplete: false
  });

  const handleGenerateImages = async () => {
    if (!story.trim()) return;

    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress({ step: "Analyzing your story...", progress: 20, isComplete: false });

    try {
      // Step 1: Analyze the story
      const analysisResponse = await fetch("/api/analyze-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze story");
      }

      const { scenes } = await analysisResponse.json();
      setProgress({ step: "Creating magical images...", progress: 50, isComplete: false });

      // Step 2: Generate images for each scene
      const imageResponse = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to generate images");
      }

      const { images } = await imageResponse.json();
      setGeneratedImages(images);
      setProgress({ step: "Images ready!", progress: 100, isComplete: true });

    } catch (error) {
      console.error("Generation failed:", error);
      setProgress({ step: "Something went wrong. Please try again!", progress: 0, isComplete: false });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const characterCount = story.length;
  const maxCharacters = 2000;
  const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-700 flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" />
            Welcome, Young Storyteller!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Write your story below and watch it come to life with beautiful pictures!
            I&apos;ll create 2-5 magical images that perfectly match your tale.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Story Input Section */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-xl text-purple-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Your Amazing Story
          </CardTitle>
          <CardDescription>
            Write your story here - be creative and descriptive! Tell us about characters, places, and exciting moments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Once upon a time, there was a brave young explorer who discovered a magical forest filled with talking animals and glowing flowers..."
              className="min-h-[200px] text-base leading-relaxed border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              maxLength={maxCharacters}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
              {wordCount} words • {characterCount}/{maxCharacters}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              Tip: Include characters
            </Badge>
            <Badge variant="outline" className="border-pink-200 text-pink-700">
              Tip: Describe settings
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              Tip: Add exciting moments
            </Badge>
          </div>

          <div className="text-center">
            <Button
              onClick={handleGenerateImages}
              disabled={isGenerating || !story.trim() || characterCount < 50}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Story Images
                </>
              )}
            </Button>
            {story.trim() && characterCount < 50 && (
              <p className="text-sm text-amber-600 mt-2">
                Please write at least 50 characters for better image generation!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isGenerating && (
        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">
                  {progress.step}
                </h3>
                <Progress value={progress.progress} className="w-full h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  {progress.progress}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Images Section */}
      {generatedImages.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl text-purple-700 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Story Images ({generatedImages.length})
            </CardTitle>
            <CardDescription>
              Here are the magical images created from your story! Click download to save them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image, index) => (
                <div key={image.id} className="space-y-3">
                  <div className="relative group rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={image.url}
                      alt={image.description}
                      className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ae387152-9407-4c2f-9798-ac7377b97503.png + 1}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={() => downloadImage(image.url, `story-image-${index + 1}.jpg`)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 text-gray-800 hover:bg-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-purple-700 mb-1">
                      {image.sceneTitle}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {image.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Stories */}
      <Card className="border-purple-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700">
            Need Inspiration? Try These Story Ideas!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-white/60 rounded-lg">
              <strong>The Magic Garden:</strong> A young gardener discovers that their vegetables can talk and need help saving their garden from a mischievous rabbit...
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <strong>Space Adventure:</strong> Two friends build a rocket ship and travel to a planet made entirely of colorful candy, where they meet friendly alien creatures...
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <strong>The Time Travel Clock:</strong> A curious student finds an old clock that can take them to any time period, leading to exciting adventures through history...
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <strong>Ocean Mystery:</strong> A young marine biologist discovers a hidden underwater city populated by talking sea creatures who need help solving an ancient puzzle...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}