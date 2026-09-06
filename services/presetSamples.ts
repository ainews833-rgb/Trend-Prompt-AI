import { GeneratedPromptResult, PromptMode } from "@/types";

export interface TrendPreset {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  badge: string;
  description: string;
  mode: PromptMode;
  trendStyle: string;
  trendScore: number;
  visualCharacteristics: string[];
  sampleResult: Omit<GeneratedPromptResult, 'id' | 'createdAt' | 'isFavorited'>;
}

export const PRESET_TRENDS: TrendPreset[] = [
  {
    id: "cinematic-golden-hour",
    title: "Cinematic Golden Hour Portrait",
    category: "Photography",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    badge: "Trending #1",
    description: "Warm rim lighting, shallow depth of field, 85mm lens editorial aesthetic.",
    mode: "cinematic",
    trendStyle: "High-End Golden Hour Editorial",
    trendScore: 96,
    visualCharacteristics: [
      "Warm atmospheric backlight",
      "Creamy bokeh with 85mm f/1.4",
      "Catchlights in eyes",
      "Earthy golden color grading",
      "Cinematic 35mm film grain"
    ],
    sampleResult: {
      title: "Cinematic Golden Hour Editorial",
      mode: "cinematic",
      referenceImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      referenceDimensions: { width: 1000, height: 1333, fileSizeFormatted: "340 KB" },
      tags: ["Cinematic", "Golden Hour", "Portrait", "Editorial"],
      settingsUsed: {
        promptDetail: "high",
        preserveComposition: 90,
        preserveStyle: 95,
        preservePose: 85,
        preserveEnvironment: 80,
        creativity: 30,
        outputStyle: "Cinematic",
        targetPlatform: "midjourney"
      },
      trendInsights: {
        trendStyle: "High-End Golden Hour Editorial",
        visualCharacteristics: [
          "Warm atmospheric backlight",
          "Creamy bokeh with 85mm f/1.4",
          "Catchlights in eyes",
          "Earthy golden color grading",
          "Cinematic 35mm film grain"
        ],
        trendScore: 96,
        explanation: "Matches top tier viral Instagram and Pinterest editorial portrait trends with gentle lens flare and soft flattering key light."
      },
      structuredAnalysis: {
        subject: "Single subject in a relaxed, confident half-body stance gazing subtly off-camera with a serene expression.",
        pose: "Three-quarters profile turned slightly toward light source, shoulders angled, natural chin tilt.",
        composition: "Rule-of-thirds framing with subject placed along the right vertical line, generous negative space filled with warm blurred bokeh.",
        camera: "Eye-level cinematic portrait perspective, medium close-up shot.",
        lens: "85mm prime lens at f/1.4 creating ultra-shallow depth of field and soft circular specular highlights.",
        lighting: "Dual-light setup: golden hour low-angle sunlight creating edge/rim light on hair and shoulders, filled by a soft warm diffused reflector on the facial planes.",
        environment: "Outdoor sun-drenched terrace or architectural courtyard during magic hour, soft foliage in distant background.",
        clothing: "Minimalist structured neutral linen or silk garment with understated organic textures.",
        colors: "Harmonious palette dominated by amber, warm honey, deep terracotta, muted olive, and soft cream highlights.",
        mood: "Nostalgic, intimate, introspective, high-fashion warmth.",
        style: "Contemporary magazine cover photography, 35mm film aesthetic with fine grain and gentle highlight halation.",
        background: "Smooth, dreamy out-of-focus background with layered warmth and gentle light leak effect.",
        image_quality: "Crisp optical sharpness on the subject's near eye and skin texture, organic film halation, zero artificial over-sharpening.",
        identity_preservation: "Instruction: Use the user's uploaded photo as the identity and face reference. Maintain the user's authentic facial geometry, eye shape, and hairstyle while adopting the exact lighting, pose, and color grading of the reference.",
        special_details: "Micro-dust particles illuminated in the sunbeam, subtle chromatic aberration on out-of-focus background edges."
      },
      fullPrompt: "Cinematic editorial portrait recreating the visual composition, lighting, and mood of the reference image. Use the user's uploaded photo as the identity reference, faithfully preserving their facial features and recognizable identity. The subject is captured in a confident three-quarter profile medium shot, illuminated by low-angle warm golden hour sunbeams casting gentle rim lighting across the hair and shoulders, with soft diffused fill lighting across facial contours. Shot on 85mm f/1.4 prime lens at eye level, ultra-shallow depth of field, creamy circular bokeh in background. Neutral minimalist styling, harmonious palette of warm amber, honey, and muted earth tones. Subtle 35mm organic film grain, clean highlight roll-off, Vogue editorial aesthetic.",
      shortPrompt: "Cinematic 85mm golden-hour portrait using the uploaded user photo for identity. Warm rim lighting, shallow depth of field, honey amber color palette, editorial magazine aesthetic.",
      detailedPrompt: "Professional cinematic medium-closeup portrait where the user's uploaded photo provides the identity and facial structure. The composition maintains the precise framing of the reference: subject positioned along the right third, slightly angled torso, relaxed gaze. Lighting is crafted from an authentic golden-hour sunset angle at 45 degrees behind the subject creating a luminous rim on hair and garments, paired with a soft 4x4 diffusion bounce filling facial shadows naturally. Shot on Arri Alexa 85mm prime at f/1.4 with subtle anamorphic horizontal flare hints, delicate film halation around bright highlights, and authentic Kodak Vision3 250D color grading.",
      midjourneyFormat: "editorial portrait, use uploaded user photo as identity reference, 85mm f/1.4 lens, golden hour rim lighting, soft fill light, creamy bokeh, warm honey and terracotta palette, 35mm film grain, Vogue aesthetic --ar 3:4 --v 6.1 --style raw",
      fluxFormat: "Cinematic medium portrait, user photo as face identity reference. 85mm f/1.4 shallow depth of field, golden hour backlight, soft warm fill, realistic skin texture, filmic color grading, editorial masterpiece.",
      dalleFormat: "A high-end editorial portrait photograph inspired by the reference composition, using the user's photo for the subject's face and identity. Warm low-angle sunset lighting with subtle rim light, 85mm lens with blurred bokeh background, natural styling and earth tones."
    }
  },
  {
    id: "cyberpunk-neon-rain",
    title: "Cyberpunk Rainy Street Aesthetic",
    category: "Cinematic",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    badge: "Trending #2",
    description: "Wet asphalt reflections, vibrant cyan and magenta neon rim lights, moody urban atmosphere.",
    mode: "cinematic",
    trendStyle: "Neo-Noir Cyberpunk Street",
    trendScore: 94,
    visualCharacteristics: [
      "Dual-tone cyan and magenta lighting",
      "Wet pavement reflections with rain mist",
      "Moody dark city background with neon signs",
      "High dynamic range contrast",
      "Blade Runner inspired color scheme"
    ],
    sampleResult: {
      title: "Cyberpunk Rainy Street Aesthetic",
      mode: "cinematic",
      referenceImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
      referenceDimensions: { width: 1000, height: 1200, fileSizeFormatted: "410 KB" },
      tags: ["Cyberpunk", "Neon", "Cinematic", "Urban Night"],
      settingsUsed: {
        promptDetail: "high",
        preserveComposition: 90,
        preserveStyle: 95,
        preservePose: 85,
        preserveEnvironment: 90,
        creativity: 35,
        outputStyle: "Cinematic",
        targetPlatform: "midjourney"
      },
      trendInsights: {
        trendStyle: "Neo-Noir Cyberpunk Street",
        visualCharacteristics: [
          "Dual-tone cyan and magenta lighting",
          "Wet pavement reflections with rain mist",
          "Moody dark city background with neon signs",
          "High dynamic range contrast",
          "Blade Runner inspired color scheme"
        ],
        trendScore: 94,
        explanation: "Viral visual trend combining rainy night textures, bold neon color contrasts, and futuristic yet relatable street fashion."
      },
      structuredAnalysis: {
        subject: "Central figure standing in a rainy futuristic cityscape, holding an umbrella or wearing a hooded techwear jacket.",
        pose: "Standing upright, direct or three-quarter gaze with subtle intense focus, raindrops glistening on shoulders.",
        composition: "Centered symmetrical or dynamic leading lines along a wet street reflecting neon storefronts.",
        camera: "Low-to-medium angle, 50mm cinematic lens, anamorphic aspect.",
        lens: "50mm anamorphic lens at f/1.8 with horizontal neon streaks and oval bokeh.",
        lighting: "Intense split-lighting with bright electric cyan key light from one side and deep neon magenta/violet backlight from the other.",
        environment: "Dense neon-lit Tokyo or Neo-Seoul alleyway at night during light rain, wet asphalt reflecting neon signage.",
        clothing: "Black water-repellent techwear jacket, high collar, subtle matte textures reflecting rain drops.",
        colors: "Deep obsidian shadows, electric cyan (#00f0ff), vivid hot magenta (#ff007f), and ambient indigo haze.",
        mood: "Mysterious, tech-noir, atmospheric, solitary, powerful.",
        style: "Blade Runner 2049 and Cyberpunk 2077 cinematic still, photorealistic high-production film capture.",
        background: "Blurred high-rise skyline with holographic billboards, neon kanji signs, and rising steam vents.",
        image_quality: "Ultra-sharp water droplets, deep true blacks with clean shadow detail, specular reflections on damp surfaces.",
        identity_preservation: "Instruction: Replace the face and head with the user's uploaded portrait while preserving the exact dual-tone neon rim lighting, rain textures, and pose from the reference.",
        special_details: "Fine mist caught in neon beams, subtle steam wisps, glowing reflection pools on asphalt."
      },
      fullPrompt: "Cinematic neo-noir cyberpunk street photograph inspired by the reference visual style. Use the uploaded user photo as the face and identity reference. The subject is positioned in the center of a rain-slicked futuristic city alleyway at night, wearing a high-collar matte techwear coat. Strong split neon lighting with vibrant electric cyan rimming the left silhouette and deep glowing magenta/violet highlighting the right side. Atmospheric rain mist, wet pavement with mirror-like reflections of neon signs and kanji billboards. Shot on 50mm anamorphic lens at f/1.8, horizontal cinematic lens flares, dark rich blacks with vivid color contrast, photorealistic 8k render.",
      shortPrompt: "Cyberpunk rain-soaked street portrait, using user's photo for identity. Vivid split cyan and magenta neon rim lighting, wet asphalt reflections, moody filmic atmosphere.",
      detailedPrompt: "High-production cinematic still set in a rain-drenched futuristic city at midnight, preserving the reference's composition and color grading. The subject's face is strictly derived from the user's uploaded portrait. Dramatic dual lighting setup with neon cyan key light and vivid magenta back rim light illuminating fine rain droplets and damp clothing fabrics. In the background, out-of-focus glowing neon signs create an anamorphic oval bokeh. Rich contrast, Arri Alexa Mini LF aesthetic, Blade Runner 2049 color grading.",
      midjourneyFormat: "cyberpunk street portrait, user photo as face reference, rainy night in Tokyo alley, intense split cyan and magenta neon lighting, wet pavement reflections, techwear jacket, 50mm anamorphic lens, cinematic film still --ar 16:9 --v 6.1 --style raw",
      fluxFormat: "Cyberpunk portrait, user photo face reference, rainy city alley at night, split neon lighting electric cyan and magenta, wet asphalt reflections, techwear coat, photorealistic high contrast.",
      dalleFormat: "A cinematic cyber-noir portrait photo in a rainy city street at night, using the uploaded user photo as the subject's face. Split neon lighting in cyan and magenta, wet asphalt with neon reflections, high-tech urban backdrop."
    }
  },
  {
    id: "old-money-aesthetic",
    title: "Old-Money European Villa Aesthetic",
    category: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop",
    badge: "Trending #3",
    description: "Sunlit stone terrace, crisp linen tailoring, quiet luxury color palette and natural sunlight.",
    mode: "social_trend",
    trendStyle: "Quiet Luxury European Summer",
    trendScore: 92,
    visualCharacteristics: [
      "Natural bright Mediterranean daylight",
      "Neutral linen and cashmere textures",
      "Historic stone villa or coastal backdrop",
      "Sophisticated desaturated film tones",
      "Understated relaxed posture"
    ],
    sampleResult: {
      title: "Old-Money European Villa Aesthetic",
      mode: "social_trend",
      referenceImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop",
      referenceDimensions: { width: 1000, height: 1250, fileSizeFormatted: "290 KB" },
      tags: ["Old Money", "Quiet Luxury", "Lifestyle", "Mediterranean"],
      settingsUsed: {
        promptDetail: "high",
        preserveComposition: 85,
        preserveStyle: 95,
        preservePose: 85,
        preserveEnvironment: 85,
        creativity: 25,
        outputStyle: "Editorial",
        targetPlatform: "midjourney"
      },
      trendInsights: {
        trendStyle: "Quiet Luxury European Summer",
        visualCharacteristics: [
          "Natural bright Mediterranean daylight",
          "Neutral linen and cashmere textures",
          "Historic stone villa or coastal backdrop",
          "Sophisticated desaturated film tones",
          "Understated relaxed posture"
        ],
        trendScore: 92,
        explanation: "One of the most persistent aesthetic trends across social media, embodying effortless timeless wealth, natural light, and tasteful neutral palettes."
      },
      structuredAnalysis: {
        subject: "Subject in an effortless, candid pose seated or leaning on an Italian or French stone balustrade.",
        pose: "Casual posture, hand resting naturally, calm composed expression, unposed candid feel.",
        composition: "Medium shot with gentle diagonal lines from the architectural balcony framing the subject.",
        camera: "Eye level, 35mm natural perspective, authentic candid feel.",
        lens: "35mm prime lens at f/2.8 providing crisp subject detail with a gentle contextual background falloff.",
        lighting: "Direct yet soft morning Mediterranean sunshine with delicate open shade fill, natural sky light.",
        environment: "Historic Lake Como or Amalfi stone villa balcony with terracotta tiles and cypress trees in distant rolling hills.",
        clothing: "Relaxed off-white linen button-down shirt, tailored cream trousers, vintage gold watch or understated sunglasses.",
        colors: "Earthy neutrals: travertine stone beige, crisp cream, olive foliage green, terracotta, and soft sky blue.",
        mood: "Effortless, serene, cultured, timeless luxury, sun-warmed.",
        style: "Tatler and Town & Country lifestyle editorial, medium format Contax 645 film look with pastel highlight rolloff.",
        background: "Sun-dappled stone columns, potted lemon trees, distant blue water or rolling Tuscan hills.",
        image_quality: "Natural film grain, clean skin tones without digital smoothing, tactile linen fabric weave texture.",
        identity_preservation: "Instruction: Map the uploaded user's facial likeness, bone structure, and hairstyle onto the subject while maintaining the exact old-money wardrobe, posture, and European villa setting.",
        special_details: "Morning espresso cup on stone side table, soft shadows of olive leaves dancing on the shirt."
      },
      fullPrompt: "Quiet luxury lifestyle portrait recreating the visual tone and atmosphere of the reference image. Use the user's uploaded photo as the identity and face reference. The subject is captured in an effortless, candid posture on a sunlit historic Italian villa terrace, leaning against an ancient carved stone balustrade. Dressed in relaxed cream linen tailoring with understated styling. Bathed in warm, crisp Mediterranean morning sunlight with soft open shade fill. 35mm film photography look, soft pastel color grade, natural travertine beige and olive tones, timeless European holiday aesthetic, subtle organic film texture.",
      shortPrompt: "Old money European villa portrait, user photo for face identity. Cream linen attire, sun-drenched Italian stone balcony, 35mm film aesthetic, relaxed quiet luxury.",
      detailedPrompt: "High-end editorial lifestyle photograph embodying the quiet luxury aesthetic of the reference. The user's uploaded portrait is used as the face and identity reference. Captured on a Mediterranean stone estate terrace overlooking Lake Como. The subject wears an open-collar ivory linen shirt with rolled sleeves and classic tailored trousers. Natural soft morning sun creates delicate highlights on the fabric and warm skin tones. Shot on Contax 645 with Kodak Portra 400 film, natural skin grain, subtle lens vignette, elegant aristocratic charm.",
      midjourneyFormat: "quiet luxury editorial portrait, user photo as identity reference, historic Italian villa terrace, cream linen shirt, Mediterranean morning sunlight, 35mm Contax 645 film aesthetic, Kodak Portra 400 --ar 4:5 --v 6.1 --style raw",
      fluxFormat: "Editorial portrait, user photo face reference, quiet luxury aesthetic, Italian stone balcony, morning sunlight, ivory linen clothes, film photography tones, high realism.",
      dalleFormat: "A candid lifestyle portrait photo in an old-money Mediterranean villa, featuring the face from the uploaded user photo. Wearing cream linen, on a sunlit stone terrace with olive trees and historic architecture."
    }
  },
  {
    id: "dark-studio-fashion",
    title: "Moody High-Contrast Studio Fashion",
    category: "Commercial",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
    badge: "Trending #4",
    description: "Single directional key light, deep sculpted shadows, minimalist charcoal backdrop, GQ cover vibe.",
    mode: "photorealistic",
    trendStyle: "High-Fashion Editorial Chiaroscuro",
    trendScore: 95,
    visualCharacteristics: [
      "Chiaroscuro Rembrandt lighting",
      "Deep black and charcoal background",
      "Sculpted facial shadows and cheekbone highlights",
      "Sharp high-end studio strobe light",
      "Sophisticated monochromatic or muted palette"
    ],
    sampleResult: {
      title: "Moody High-Contrast Studio Fashion",
      mode: "photorealistic",
      referenceImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
      referenceDimensions: { width: 1000, height: 1500, fileSizeFormatted: "310 KB" },
      tags: ["Studio", "Chiaroscuro", "Fashion", "Editorial", "GQ"],
      settingsUsed: {
        promptDetail: "high",
        preserveComposition: 95,
        preserveStyle: 95,
        preservePose: 90,
        preserveEnvironment: 85,
        creativity: 20,
        outputStyle: "Studio",
        targetPlatform: "midjourney"
      },
      trendInsights: {
        trendStyle: "High-Fashion Editorial Chiaroscuro",
        visualCharacteristics: [
          "Chiaroscuro Rembrandt lighting",
          "Deep black and charcoal background",
          "Sculpted facial shadows and cheekbone highlights",
          "Sharp high-end studio strobe light",
          "Sophisticated monochromatic or muted palette"
        ],
        trendScore: 95,
        explanation: "Timeless studio lighting setup used by iconic photographers like Peter Lindbergh and Annie Leibovitz, showcasing facial bone structure and deep emotion."
      },
      structuredAnalysis: {
        subject: "Single subject in an intense, sculptural close-up or bust portrait looking directly into lens.",
        pose: "Square or slightly angled shoulders, head turned slightly, intense brooding or charismatic expression.",
        composition: "Tight bust crop with subject dominating the frame, dynamic diagonal shadow across the face.",
        camera: "Direct eye-level studio portrait, 105mm telephoto macro lens.",
        lens: "105mm f/2.8 portrait macro lens capturing razor-sharp skin pores and iris detail.",
        lighting: "Single large octabox key light placed at a 45-degree angle above the subject, producing classic Rembrandt triangle shadow on the opposite cheek.",
        environment: "Dark seamless studio backdrop in matte charcoal grey or deep black.",
        clothing: "Dark charcoal wool turtleneck, tailored blazer, or black minimalist knitwear.",
        colors: "High-contrast monochrome with warm skin tones against cool slate and obsidian shadows.",
        mood: "Intense, sophisticated, commanding, cinematic, sculptural.",
        style: "GQ magazine cover portrait, Hasselblad medium format digital clarity.",
        background: "Subtle gradient fall-off from deep charcoal to pitch black.",
        image_quality: "Micro-contrast on skin texture, realistic catchlights in pupils, no blown highlights.",
        identity_preservation: "Instruction: Preserve the exact facial features, jawline, and eyes of the user's uploaded portrait while applying the dramatic single-strobe studio lighting and black turtleneck styling.",
        special_details: "Single specular highlight in both eyes, defined jawline shadow carving the profile."
      },
      fullPrompt: "High-fashion studio portrait recreating the dramatic chiaroscuro lighting and composition of the reference image. Use the uploaded user photo as the face and identity reference. The subject is framed in an intense close-up bust shot against a seamless dark charcoal studio backdrop. Illuminated by a single directional octabox key light from a 45-degree angle, casting deep sculpted shadows and a distinct Rembrandt light patch on the cheek. Crisp focus on eyes with natural catchlights, dark tailored knitwear, high dynamic range, Hasselblad H6D-100c medium-format digital fidelity, GQ editorial cover quality.",
      shortPrompt: "Studio fashion portrait, user photo for face identity. Dramatic Rembrandt key lighting, dark charcoal backdrop, sculpted shadows, high-end editorial clarity.",
      detailedPrompt: "Masterclass studio portrait adhering strictly to the reference's sculptural lighting scheme. The user's photo provides the identity, facial geometry, and hairstyle. Captured with a Profoto B10 strobe with beauty dish positioned high right, creating dramatic shadow transitions across the cheekbones and jaw. Subject wears a minimalist black merino wool turtleneck. Clean charcoal studio paper background with subtle falloff. Shot on Hasselblad 100MP with 105mm prime lens at f/5.6, hyper-realistic skin pores and natural reflections.",
      midjourneyFormat: "studio portrait, user photo as face identity, dramatic Rembrandt lighting, single softbox strobe, dark charcoal backdrop, black turtleneck, GQ cover style, Hasselblad 105mm f/5.6, razor sharp --ar 4:5 --v 6.1 --style raw",
      fluxFormat: "Studio portrait, user photo face reference, high-contrast chiaroscuro lighting, deep shadows, dark grey background, black turtleneck, hyper-detailed skin texture, editorial perfection.",
      dalleFormat: "A professional studio portrait photograph with dramatic side lighting, using the user's uploaded photo for the face and identity. Deep shadows, dark charcoal studio background, minimalist black clothing, sharp focus."
    }
  }
];
