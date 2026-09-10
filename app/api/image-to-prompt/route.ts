import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export const maxDuration = 60;

interface ImageToPromptPayload {
  image?: string; // base64 data URL or raw base64
  imageUrl?: string; // external image URL
  userPhoto?: string; // optional personal face reference
  mode?: "photorealistic" | "cinematic" | "creative" | "detailed";
  style?: string;
  advancedSettings?: {
    cameraLens?: string;
    lightingPreset?: string;
    outputStyle?: string;
    faceLockStrength?: number;
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ImageToPromptPayload = await req.json();
    const imageInput = body.image || body.imageUrl;

    if (!imageInput) {
      return NextResponse.json(
        { error: "Image input is required. Provide 'image' (base64 data URL) or 'imageUrl'." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    if (!ai) {
      return NextResponse.json(
        { error: "Gemini AI client is not configured. GEMINI_API_KEY environment variable is required." },
        { status: 500 }
      );
    }

    // Convert input into Gemini-compatible inline data part
    let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

    if (imageInput.startsWith("data:")) {
      const matches = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        imagePart = {
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        };
      }
    } else if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      // Fetch image from URL
      const imgRes = await fetch(imageInput);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: {
            mimeType: contentType.split(";")[0],
            data: base64Data,
          },
        };
      }
    }

    const mode = body.mode || "photorealistic";
    const style = body.style || body.advancedSettings?.outputStyle || "Photorealistic";

    const systemInstruction = `
You are the world's most capable AI Prompt Reverse-Engineer and Editorial Photographic Director.
Your task is to analyze the provided image in extraordinary detail and produce a complete, production-ready AI prompt package that allows creators to recreate the visual style, composition, lighting, and wardrobe with absolute precision in Midjourney, Flux.1, Leonardo.ai, and DALL-E 3.

CRITICAL MULTI-SECTION PROMPT FORMAT:
You MUST construct the "fullPrompt" in this EXACT structured layout:

Create a picture of this woman unchanged her feature face Subject: [Detailed description of subject, stance, pose, expression, facial makeup/contour, highlight, lip color, confident gaze]

Hair: [Specific hair length, color, styling, soft voluminous waves, strands swept by breeze, texture, dynamic movement]

Dress & Style: [Exact clothing style, fabric type, texture, cut, fit, layered details, climate suitability]

Accessories: [Specific accessories: sunglasses (dark oval-shaped, substantial frame), handbag (classic black quilted handbag with gold chain strap, high-end designer reminiscent of Chanel), jewelry (delicate gold ring on hand), etc.]

Vibe & Emotion: [Sophisticated vacation, luxury, relaxed glamour, confidence, allure, poised elegance]

Lighting: [Bright natural sunlight, clear day, subtle highlights on hair and skin, gentle shadows, depth]

Colors: [Dominant colors, vibrant blue of sea/sky, lush green foliage, road tones, wardrobe contrasts]

Background: [Stunning coastal or environmental landscape, clear calm horizon, distant mountains/hills, foreground pathway/road flanked by green bushes/trees, hints of resort or upscale architecture]

Camera Angle & Composition: [Medium-close up focusing on subject from waist up, camera positioned slightly below eye level, off-center placement with expansive backdrop, leading lines]

Photography Style: [High resolution, sharp optical focus on subject, natural vibrant color palette, candid yet perfectly styled travel or fashion photograph, capturing effortless elegance]

RESPOND STRICTLY IN VALID JSON MATCHING THIS SCHEMA:
{
  "title": "A punchy 3-6 word title for this visual trend",
  "fullPrompt": "The complete ultra-detailed prompt using the exact sections above",
  "shortPrompt": "A high-impact 30-word concise version",
  "detailedPrompt": "The expanded master prompt",
  "midjourneyFormat": "Midjourney prompt formatted with --ar 3:4 --v 6.1 --style raw",
  "leonardoFormat": "Leonardo.ai prompt with Character Reference guidance",
  "fluxFormat": "Flux.1 realism prompt with camera/sensor details",
  "dalleFormat": "DALL-E 3 natural language descriptive prompt",
  "negativePrompt": "distorted face, plastic skin, CGI, 3D render, low quality, bad hands, mutated anatomy, deformed eyes, extra limbs",
  "tags": ["Photorealistic", "Editorial", "Trending", "Fashion"],
  "analysis": {
    "subject": "Description of subject",
    "lighting": "Lighting details",
    "camera": "Lens and focal length details",
    "composition": "Composition layout",
    "environment": "Setting and backdrop details",
    "wardrobe": "Clothing and accessories breakdown"
  }
}
`;

    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];
    if (imagePart) {
      contents.push(imagePart);
    }
    contents.push(
      `Analyze this image. Output Style: ${style}, Mode: ${mode}. Reverse-engineer the photographic blueprint and output the JSON format strictly.`
    );

    const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let response;
    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed in image-to-prompt, attempting fallback:`, err);
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content with Gemini models");
    }

    const responseText = response.text || "{}";
    let parsedData: Record<string, unknown> = {};

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: unknown) {
    console.error("Image to prompt error:", error);
    const message = error instanceof Error ? error.message : "Image analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
