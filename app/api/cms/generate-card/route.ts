import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getGeminiClient } from "@/lib/gemini";

interface GenerateCardRequest {
  idea: string;
  category?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateCardRequest = await req.json();
    const idea = body.idea?.trim();

    if (!idea) {
      return NextResponse.json(
        { error: "Please provide a concept or prompt idea." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    let generatedCard: {
      title: string;
      category: string;
      promptBody: string;
      midjourneyFormat: string;
      leonardoFormat: string;
      fluxFormat: string;
      negativePrompt: string;
      tags: string[];
      visualSummary: string;
    };

    if (ai) {
      try {
        const promptInstruction = `
You are an expert photographic director and prompt engineer for high-fashion, editorial, and viral aesthetic photography.
The user wants to create a new promo card based on this concept: "${idea}".

You MUST generate a comprehensive, ultra-detailed prompt in this EXACT multi-section format:

Create a picture of this woman unchanged her feature face Subject: [Comprehensive description of the subject, pose, expression, facial makeup/contour, highlight, lip color, confident chic gaze]

Hair: [Specific hair length, color, styling, soft voluminous waves, strands swept by breeze, texture, dynamic movement]

Dress & Style: [Exact clothing style, fabric type, texture, cut, fit, layered details, suitable climate]

Accessories: [Specific accessories: sunglasses (dark oval-shaped, substantial frame), handbag (classic black quilted handbag with gold chain strap, high-end designer reminiscent of Chanel), jewelry (delicate gold ring on hand), etc.]

Vibe & Emotion: [Sophisticated vacation, luxury, relaxed glamour, confidence, allure, poised elegance]

Lighting: [Bright natural sunlight, clear day, subtle highlights on hair and skin, gentle shadows, depth]

Colors: [Dominant colors, vibrant blue of sea/sky, lush green foliage, road tones, wardrobe contrasts]

Background: [Stunning coastal or environmental landscape, clear calm horizon, distant mountains/hills, foreground pathway/road flanked by green bushes/trees, hints of resort or upscale architecture]

Camera Angle & Composition: [Medium-close up focusing on subject from waist up, camera positioned slightly below eye level, off-center placement with expansive backdrop, leading lines]

Photography Style: [High resolution, sharp optical focus on subject, natural vibrant color palette, candid yet perfectly styled travel or fashion photograph, capturing effortless elegance]

Respond strictly in valid JSON matching this schema:
{
  "title": "A punchy 3-6 word editorial title",
  "category": "Photorealistic & Portraits" or "Fashion & Editorial" or "Cinematic & Film" or "Lifestyle Photography",
  "promptBody": "The full ultra-detailed prompt using the exact sections above",
  "midjourneyFormat": "Midjourney v6.1 prompt formatted with --ar 3:4 --v 6.1 --style raw",
  "leonardoFormat": "Leonardo.ai prompt with Character Reference notes",
  "fluxFormat": "Flux.1 high-realism prompt",
  "negativePrompt": "distorted face, plastic skin, CGI, 3D render, low quality, bad hands, mutated anatomy, deformed eyes",
  "tags": ["AI Generated", "Trending", "Photorealistic", "Editorial"],
  "visualSummary": "A concise 15-20 word photographic description used to generate the card's preview photo"
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptInstruction,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const text = response.text || "{}";
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(text);
        } catch {
          const m = text.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        }

        generatedCard = {
          title: (parsed.title as string) || idea.slice(0, 45),
          category: (parsed.category as string) || body.category || "Photorealistic & Portraits",
          promptBody: (parsed.promptBody as string) || buildStructuredPrompt(idea),
          midjourneyFormat: (parsed.midjourneyFormat as string) || `${idea}, Hasselblad 85mm f/1.4, Kodak Portra 400, editorial lighting --ar 3:4 --v 6.1 --style raw`,
          leonardoFormat: (parsed.leonardoFormat as string) || `${idea}, 35mm film grain, atmospheric depth, editorial portrait --strength 0.88`,
          fluxFormat: (parsed.fluxFormat as string) || `${idea}, cinematic lighting, authentic skin texture, 8k resolution`,
          negativePrompt: (parsed.negativePrompt as string) || "distorted face, plastic skin, CGI, 3D render, low quality, bad hands, mutated anatomy",
          tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]) : ["Trending", "Photorealistic", "Editorial"],
          visualSummary: (parsed.visualSummary as string) || idea,
        };
      } catch (geminiError: unknown) {
        console.warn("Gemini generation failed, using intelligent fallback builder:", geminiError);
        generatedCard = buildIntelligentCard(idea, body.category);
      }
    } else {
      generatedCard = buildIntelligentCard(idea, body.category);
    }

    // Generate a REAL, UNIQUE, dynamic Flux AI image URL based on the visual concept with dynamic random seed
    const seed = Math.floor(Math.random() * 9000000) + 1000000;
    const cleanVisualPrompt = encodeURIComponent(
      `${generatedCard.visualSummary || idea}, stylish aesthetic editorial portrait, high fashion, 85mm lens, natural daylight, photorealistic, 8k, authentic skin texture`
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanVisualPrompt}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      card: {
        ...generatedCard,
        imageUrl,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildStructuredPrompt(concept: string): string {
  return `Create a picture of this woman unchanged her feature face Subject: A stylish young woman posing outdoors with a scenic coastal background inspired by ${concept}. She is looking back over her shoulder towards the viewer, with a confident and chic expression. Natural makeup brown contour and highlight, rose lip color.

Hair: Long, luscious Light brown hair styled in soft, voluminous waves, with some strands gently swept back by the breeze, adding a dynamic element to the image.

Dress & Style: She is wearing a light blue, possibly striped or textured, halter-neck or strapless top with a ruffled or layered detail. The fabric appears light and airy, suitable for a warm climate.

Accessories: Sunglasses: Fashionable dark, oval-shaped sunglasses with a substantial frame. Handbag: A classic black quilted handbag with a gold chain strap, likely a high-end designer bag (reminiscent of Chanel). The bag is worn over her shoulder, resting against her side. Jewelry: A delicate gold ring is visible on her right hand, which is raised to adjust her sunglasses or playfully touch her hair.

Vibe & Emotion: The overall vibe is one of sophisticated vacation, luxury, and relaxed glamour. Her pose and expression convey confidence, allure, and a sense of enjoying a beautiful destination.

Lighting: Bright and natural sunlight, typical of a clear day. The lighting creates subtle highlights on her hair and skin, and casts gentle shadows, giving depth to the scene.

Colors: The dominant colors are the vibrant blue of the sea and sky, the lush greens of the foliage, the light tones of the road, and the woman's dark hair and black accessories contrasted by her light blue top.

Background: A stunning coastal landscape with a clear, calm blue sea extending to the horizon. In the distance, faint outlines of mountains or hills are visible. The foreground features a well-maintained pathway or road flanked by green, manicured bushes and mature trees (possibly pines). There are hints of white buildings or structures in the distance near the coastline, suggesting a resort or upscale area.

Camera Angle & Composition: The shot is a medium-close up, focusing on the woman from the waist up. The camera is positioned slightly below eye level, which can be flattering. The composition places her slightly off-center, with the expansive sea and sky providing a beautiful and balanced backdrop. The winding road leads the eye towards the distant water.

Photography Style: The image appears to be high-resolution, with sharp focus on the subject and a natural, vibrant color palette. It has the feel of a candid yet perfectly styled travel or fashion photograph, capturing an effortless elegance.`;
}

function buildIntelligentCard(concept: string, category?: string) {
  const title = concept.split(".")[0].slice(0, 48);
  const promptBody = buildStructuredPrompt(concept);

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    category: category || "Photorealistic & Portraits",
    promptBody,
    midjourneyFormat: `${concept}, editorial portrait, unchanged facial identity, 85mm prime lens, soft natural lighting, creamy bokeh, Kodak Portra 400 tones --ar 3:4 --v 6.1 --style raw`,
    leonardoFormat: `${concept}, photorealistic portrait, authentic 35mm film grain, directional sunlight, high editorial detail --strength 0.88`,
    fluxFormat: `${concept}, candid high-resolution portrait, golden natural lighting, authentic skin micro-pores, 8k photographic definition`,
    negativePrompt: "altered face, modified face, changed nose, distorted face, plastic skin, CGI, 3D render, low quality, bad hands, mutated anatomy",
    tags: ["Trending", "Photorealistic", "Editorial", "Face Locked"],
    visualSummary: concept,
  };
}
