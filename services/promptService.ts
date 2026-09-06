import { AdvancedSettings, GeneratedPromptResult, PromptMode } from "@/types";

export class PromptService {
  public static async analyzeImage(
    referenceImage: string,
    mode: PromptMode,
    advancedSettings: AdvancedSettings,
    userPhoto?: string,
    dimensions?: { width: number; height: number; fileSizeFormatted?: string }
  ): Promise<GeneratedPromptResult> {
    const response = await fetch("/api/analyze-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceImage,
        userPhoto,
        mode,
        advancedSettings,
        dimensions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to generate prompt from analysis");
    }

    return data.data as GeneratedPromptResult;
  }

  public static downloadPrompt(prompt: GeneratedPromptResult): void {
    const content = `=========================================
TRENDPROMPT AI — GENERATED PROMPT EXPORT
=========================================
Title: ${prompt.title}
Mode: ${prompt.mode}
Style: ${prompt.settingsUsed.outputStyle}
Created: ${new Date(prompt.createdAt).toLocaleString()}
Trend Score: ${prompt.trendInsights.trendScore}/100 (${prompt.trendInsights.trendStyle})

-----------------------------------------
PRIMARY PROMPT (Midjourney / Flux / SDXL)
-----------------------------------------
${prompt.fullPrompt}

-----------------------------------------
MIDJOURNEY OPTIMIZED
-----------------------------------------
${prompt.midjourneyFormat}

-----------------------------------------
FLUX.1 / SDXL OPTIMIZED
-----------------------------------------
${prompt.fluxFormat}

-----------------------------------------
DALL-E 3 OPTIMIZED
-----------------------------------------
${prompt.dalleFormat}

-----------------------------------------
STRUCTURED VISUAL DECONSTRUCTION
-----------------------------------------
• Subject: ${prompt.structuredAnalysis.subject}
• Pose: ${prompt.structuredAnalysis.pose}
• Composition: ${prompt.structuredAnalysis.composition}
• Camera: ${prompt.structuredAnalysis.camera}
• Lens: ${prompt.structuredAnalysis.lens}
• Lighting: ${prompt.structuredAnalysis.lighting}
• Environment: ${prompt.structuredAnalysis.environment}
• Wardrobe: ${prompt.structuredAnalysis.clothing}
• Colors & Mood: ${prompt.structuredAnalysis.colors} | ${prompt.structuredAnalysis.mood}
• Identity Replacement: ${prompt.structuredAnalysis.identity_preservation}

-----------------------------------------
HOW TO USE WITH YOUR OWN PHOTO:
1. Open Midjourney (or Flux/SDXL/DALL-E 3).
2. Upload your own portrait as the image/identity prompt.
3. Paste this generated prompt.
4. Enjoy your custom recreation of the trend!
=========================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trendprompt-${prompt.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
