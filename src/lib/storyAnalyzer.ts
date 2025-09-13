import { StoryScene, callAI } from "./aiConfig";

export async function analyzeStory(story: string): Promise<StoryScene[]> {
  const analysisPrompt = `
You are an expert in children's literature and storytelling for ages 10-12. Analyze the following story and identify 2-5 key scenes that would make the best visual illustrations for storytelling.

Story to analyze:
"""
${story}
"""

For each scene, provide:
1. A clear title for the scene
2. A detailed description of what happens
3. Main characters involved
4. The setting/location
5. A detailed visual prompt for image generation (optimized for child-friendly illustrations)

Requirements:
- Select 2-5 most important and visually interesting scenes
- Focus on scenes that advance the plot or show character development
- Ensure all content is appropriate for children ages 10-12
- Visual prompts should describe bright, colorful, engaging illustrations
- Avoid scary, violent, or inappropriate content
- Include diverse characters when possible

Respond with a JSON array of scenes in this exact format:
[
  {
    "id": "scene-1",
    "title": "Scene Title",
    "description": "What happens in this scene",
    "characters": ["Character 1", "Character 2"],
    "setting": "Location description",
    "visualPrompt": "Detailed image generation prompt focusing on child-friendly illustration style, bright colors, and engaging characters",
    "order": 1
  }
]

Only respond with valid JSON, no additional text.
  `;

  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are an expert children's story analyst. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: analysisPrompt
      }
    ]);

    // Parse the JSON response
    const scenes: StoryScene[] = JSON.parse(response);
    
    // Validate and sanitize the scenes
    return scenes.filter(scene => 
      scene.id && 
      scene.title && 
      scene.description && 
      scene.visualPrompt &&
      scene.order
    ).slice(0, 5); // Limit to max 5 scenes

  } catch (error) {
    console.error("Story analysis failed:", error);
    
    // Fallback: Create basic scenes from the story
    return createFallbackScenes(story);
  }
}

function createFallbackScenes(story: string): StoryScene[] {
  // Simple fallback if AI analysis fails
  const words = story.split(" ");
  const storyLength = words.length;
  
  if (storyLength < 50) {
    return [{
      id: "scene-1",
      title: "The Main Scene",
      description: "The main moment from your story",
      characters: ["Main Character"],
      setting: "Story Setting",
      visualPrompt: `Child-friendly illustration of: ${story.slice(0, 200)}. Bright colors, cartoon style, suitable for children's book, cheerful and engaging atmosphere.`,
      order: 1
    }];
  }

  // Create 2-3 scenes for longer stories
  const midPoint = Math.floor(storyLength / 2);
  const scenes: StoryScene[] = [];

  scenes.push({
    id: "scene-1",
    title: "The Beginning",
    description: "How the story starts",
    characters: ["Main Character"],
    setting: "Opening Setting",
    visualPrompt: `Child-friendly illustration showing the beginning of this story: ${words.slice(0, 50).join(" ")}. Bright, colorful, cartoon-style illustration perfect for children aged 10-12.`,
    order: 1
  });

  if (storyLength > 100) {
    scenes.push({
      id: "scene-2",
      title: "The Adventure",
      description: "The main adventure or conflict",
      characters: ["Main Character"],
      setting: "Adventure Setting",
      visualPrompt: `Child-friendly illustration of the main adventure: ${words.slice(midPoint - 25, midPoint + 25).join(" ")}. Exciting, colorful, safe-for-children illustration with bright colors and engaging characters.`,
      order: 2
    });
  }

  scenes.push({
    id: "scene-" + (scenes.length + 1),
    title: "The Ending",
    description: "How the story concludes",
    characters: ["Main Character"],
    setting: "Final Setting",
    visualPrompt: `Child-friendly illustration of the story conclusion: ${words.slice(-50).join(" ")}. Happy, bright, colorful illustration showing a positive ending, perfect for children's storytelling.`,
    order: scenes.length + 1
  });

  return scenes;
}

export function createChildFriendlyPrompt(scene: StoryScene): string {
  return `
Create a beautiful, child-friendly illustration for a children's story book:

Scene: ${scene.title}
Story Context: ${scene.description}
Characters: ${scene.characters.join(", ")}
Setting: ${scene.setting}

Style Requirements:
- Bright, vibrant colors that appeal to children aged 10-12
- Cartoon or illustration style similar to popular children's books
- Safe, positive, and engaging visual content
- Clear, friendly character designs with expressive faces
- Detailed background that supports the story
- High quality, professional children's book illustration style

Specific Visual Elements: ${scene.visualPrompt}

Avoid: scary content, dark themes, realistic violence, inappropriate material

Focus on: joy, wonder, adventure, friendship, positive emotions, magical elements, colorful environments
  `.trim();
}