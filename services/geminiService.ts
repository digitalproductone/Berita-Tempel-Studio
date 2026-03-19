
import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { TEXT_GENERATION_MODEL, IMAGE_REIMAGINATION_MODEL, AI_SUITE_MODEL, COMIC_STYLE_OPTIONS } from '../constants';
import type { GeneratedContent, GeneratedContentV2, AiStrategy, Language, ImageAiStyle, ComicLayout, ComicStyle, ComicPanel, ComicAspectRatio } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textGenModel = TEXT_GENERATION_MODEL;
const imageGenModel = IMAGE_REIMAGINATION_MODEL;
const aiSuiteModel = AI_SUITE_MODEL;
// Using Veo fast for better interactivity
const veoModel = 'veo-3.1-fast-generate-preview'; 

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function generateTextFromUrl(url: string, language: Language): Promise<GeneratedContent | null> {
  const languageInstruction = language === 'id' 
    ? `**BAHASA INDONESIA (CRITICAL)**:
       1. Output HARUS dalam Bahasa Indonesia yang natural, luwes, dan jurnalistik (seperti gaya bahasa Detik, Vice Indonesia, atau Mojok).
       2. **DILARANG KERAS** menggunakan frasa meta-referensi seperti: "Artikel ini membahas", "Berita ini menceritakan", "Dalam teks tersebut", "Penulis mengatakan".
       3. **LANGSUNG KE INTI CERITA**.
          - SALAH: "Artikel ini menceritakan tentang kecelakaan di tol."
          - BENAR: "Kecelakaan maut kembali terjadi di Tol Cipularang, menewaskan tiga orang."
       4. Gunakan kata-kata yang emosional, mendesak, dan memancing rasa ingin tahu.`
    : `**ENGLISH INSTRUCTIONS**:
       1. Output MUST be in natural, punchy, high-impact English.
       2. **STRICTLY FORBIDDEN** to use meta-references like: "The article discusses", "This news is about", "The author states".
       3. **WRITE DIRECTLY**.
          - WRONG: "The article discusses a new tech breakthrough."
          - RIGHT: "A massive tech breakthrough just changed the industry forever."`;

  const prompt = `
**Mission**: You are a Lead Editor at a high-end viral media company. Your source material is: ${url}

**Objective**: Extract the core story and rewrite it into a high-impact content package.

**JSON Structure**:
{
  "HEADLINE": "Your headline here",
  "HOOK": "Your hook here",
  "CLIMAX": "Your climax here",
  "COMIC_SCRIPT": [
    { "description": "Visual description for panel 1", "dialogue": "Short dialogue for panel 1" },
    { "description": "Visual description for panel 2", "dialogue": "Short dialogue for panel 2" },
    { "description": "Visual description for panel 3", "dialogue": "Short dialogue for panel 3" }
  ]
}

---

**Detailed Content Rules (Follow Strictly)**:

1.  **HEADLINE**:
    *   Max 10 words.
    *   Must be "Click-worthy" but not misleading.
    *   Use strong verbs. No passive voice.

2.  **HOOK**:
    *   One powerful sentence that creates immediate curiosity or shock.
    *   Start with the most interesting fact or a provocative question.
    *   **NEVER start with "The article says..."**

3.  **CLIMAX**:
    *   1-2 sentences summing up the conclusion, impact, or call to action.
    *   Make it feel like a finale.

4.  **COMIC_SCRIPT (3-Panel Arc)**:
    *   **Vibe**: Satirical, Memes, or Dramatic Re-enactment.
    *   **Panel 1 (The Setup)**: Establish the context instantly.
    *   **Panel 2 (The Conflict)**: Escalate the situation or introduce a twist.
    *   **Panel 3 (The Punchline/Payoff)**: Deliver the emotional hit or joke.
    *   **Dialogue**: Super short (Twitter style). Max 10 words/bubble. Natural speech.

---
${languageInstruction}
`;
  
  try {
    const panelSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING },
            dialogue: { type: Type.STRING },
        },
        required: ["description", "dialogue"],
    };

    const response = await ai.models.generateContent({
      model: textGenModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        safetySettings,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            HEADLINE: { type: Type.STRING },
            HOOK: { type: Type.STRING },
            CLIMAX: { type: Type.STRING },
            COMIC_SCRIPT: {
                type: Type.ARRAY,
                items: panelSchema,
            },
          },
          required: ["HEADLINE", "HOOK", "CLIMAX", "COMIC_SCRIPT"],
        },
      }
    });

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    if (jsonString && jsonString.startsWith('{') && jsonString.endsWith('}')) {
      return JSON.parse(jsonString) as GeneratedContent;
    }
    console.error("Failed to parse JSON response:", jsonString);
    return null;
  } catch (error) {
    console.error("Error generating text from URL:", error);
    return null;
  }
}

export async function generateComicAnalysisFromUrl(url: string, language: Language): Promise<GeneratedContentV2 | null> {
    const languageInstruction = language === 'id' 
      ? `**BAHASA INDONESIA (CRITICAL)**:
         1. Gunakan Bahasa Indonesia yang hidup dan profesional.
         2. **DILARANG KERAS** menggunakan frasa: "Artikel ini", "Berita tentang", "Membahas mengenai".
         3. Tulis seolah-olah Anda adalah narator langsung kejadian tersebut.
         4. Headline harus singkat, padat, dan memikat.`
      : `**ENGLISH INSTRUCTIONS**:
         1. Use vivid, professional English.
         2. **STRICTLY FORBIDDEN** phrases: "This article", "The news is about", "It discusses".
         3. Write as if you are the direct narrator of the event.`;
  
    const prompt = `
  **Mission**: You are a Creative Director for a visual storytelling platform.
  
  **Source**: ${url}
  
  **Objective**: Distill the story into a single image concept and text overlays.
  
  **JSON Structure**:
  {
    "headline": "Viral headline (Max 8 words)",
    "hook": "Intriguing opening sentence (Max 15 words)",
    "climax": "Powerful concluding sentence (Max 15 words)",
    "imagePrompt": "Detailed Stable Diffusion/Midjourney style prompt"
  }

  **Content Guidelines**:
  1. **Headline**: Punchy, Urgent, or Mysterious.
  2. **Hook**: Pull the reader in immediately. No warm-ups.
  3. **Climax**: The final takeaway.
  4. **Image Prompt**: Describe the *visual* scene vividly. Lighting, camera angle, character emotion, art style.
  
  **NEGATIVE CONSTRAINT**: Do not mention "The article" or "The text" in your output strings.
  
  ---
  ${languageInstruction}
  `;
    
    try {
      const comicAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: 'A catchy, viral-style headline.' },
          hook: { type: Type.STRING, description: 'A short, intriguing opening sentence.' },
          climax: { type: Type.STRING, description: 'A brief, powerful summary sentence.' },
          imagePrompt: { type: Type.STRING, description: 'A detailed visual description for AI image generation.' }
        },
        required: ['headline', 'hook', 'climax', 'imagePrompt'],
      };
  
      const response = await ai.models.generateContent({
        model: textGenModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          safetySettings,
          responseSchema: comicAnalysisSchema,
        }
      });
  
      let jsonString = response.text.trim();
      if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      if (jsonString && jsonString.startsWith('{') && jsonString.endsWith('}')) {
        return JSON.parse(jsonString) as GeneratedContentV2;
      }
      console.error("Failed to parse JSON response for V2:", jsonString);
      return null;
    } catch (error) {
      console.error("Error generating comic analysis from URL:", error);
      return null;
    }
}

export async function reimagineImage(base64Image: string, style: ImageAiStyle): Promise<string | null> {
    const [header, data] = base64Image.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];

    if (!mimeType || !data) {
        console.error("Invalid base64 image string");
        return null;
    }
    
    let promptText = '';
    switch (style) {
        case 'background':
            promptText = `Your task is to precisely remove the background from this image, leaving only the main subject. The background must be made fully transparent. Do not alter the subject in any way, only remove the background.`;
            break;
        case 'comic':
            promptText = `TRANSFORM this image into a panel from a dynamic, high-energy American comic book. Your role is a master comic artist.
**Key Directives:**
1.  **INKING:** Use **BOLD, confident black ink lines**. Vary line weight to create depth and drama. Use heavy shadows and cross-hatching for texture, reminiscent of gritty graphic novels.
2.  **COLORING:** Apply a vibrant, **cel-shaded color palette**. Avoid gradients. Use **halftone dot patterns (Ben Day dots)** for mid-tones and backgrounds to achieve an authentic retro comic look.
3.  **STYLE:** This is a **total stylistic conversion, NOT a filter**. Completely abandon photorealism. The final output must be a powerful, stylized illustration that feels like it was hand-drawn and inked.`;
            break;
        case 'caricature':
            promptText = `Act as a world-class caricature artist. Your task is to create a highly exaggerated, humorous, and artistic caricature from the provided image, while preserving a clear likeness of the subject.
**Key Directives:**
1.  **EXAGGERATION:** Identify the most prominent facial features (e.g., eyes, nose, smile, hair) and **dramatically amplify their size and shape**. Do not be subtle; the goal is a bold, comical distortion.
2.  **LIKENESS:** Despite the exaggeration, the subject must remain instantly recognizable. Capture their unique expression and personality.
3.  **ART STYLE:** Use fluid, expressive line work and a painterly, vibrant coloring style. The final piece should look like a masterful, hand-drawn piece of art, full of character and humor, not just a simple photo warp.`;
            break;
        case 'reimagine':
        default:
            promptText = 'Re-imagine this image. Make it more vibrant and cinematic.';
            break;
    }


    try {
        const response = await ai.models.generateContent({
            model: imageGenModel,
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: promptText },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
            },
        });
        
        const firstCandidate = response?.candidates?.[0];
        if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
                if (part.inlineData) {
                    const newMimeType = part.inlineData.mimeType;
                    const newBase64Data = part.inlineData.data;
                    return `data:${newMimeType};base64,${newBase64Data}`;
                }
            }
        } else {
             console.warn("Reimagine image returned no valid candidates. Feedback:", {
                finishReason: firstCandidate?.finishReason,
                safetyRatings: firstCandidate?.safetyRatings,
            });
        }
        return null;
    } catch (error) {
        console.error("Error reimagining image:", error);
        return null;
    }
}

export async function generateVeoVideo(base64Image: string): Promise<string | null> {
  const [header, data] = base64Image.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1];

  if (!mimeType || !data) {
      console.error("Invalid base64 image string for Veo");
      return null;
  }

  try {
      let operation = await ai.models.generateVideos({
          model: veoModel,
          image: {
              imageBytes: data,
              mimeType: mimeType
          },
          config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: '9:16' // Vertical for mobile
          }
      });

      console.log("Veo operation started", operation);

      // Polling
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({operation: operation});
        console.log("Veo polling...", operation.metadata);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
          const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
          const blob = await videoResponse.blob();
          return URL.createObjectURL(blob);
      }
      
      return null;
  } catch (error) {
      console.error("Error generating Veo video:", error);
      throw error;
  }
}

export async function generateComicStripImage(
  script: [ComicPanel, ComicPanel, ComicPanel],
  layout: ComicLayout,
  style: ComicStyle,
  language: Language,
  aspectRatio: ComicAspectRatio,
): Promise<{ data: string | null; error: string | null }> {
    if (!Array.isArray(script)) {
        return { data: null, error: "Invalid script format: expected an array of panels." };
    }

    const selectedStyle = COMIC_STYLE_OPTIONS.find(opt => opt.id === style);
    const styleInstruction = selectedStyle ? selectedStyle.promptInstruction : 'A standard comic book style.';

    let layoutDescription = '';
    switch (layout) {
        case 'strip':
            layoutDescription = 'a horizontal strip with 3 panels side-by-side.';
            break;
        case 'hero':
            layoutDescription = 'a large "hero" panel at the top, with two smaller panels underneath, side-by-side.';
            break;
        case 'focus':
            layoutDescription = 'a tall vertical panel on the left, with two smaller square panels stacked vertically on the right.';
            break;
        case 'grid':
            layoutDescription = 'two panels side-by-side at the top, and one wide panel at the bottom.';
            break;
    }

    let aspectRatioInstruction = '';
    switch (aspectRatio) {
        case 'square':
            aspectRatioInstruction = 'a 1:1 square aspect ratio';
            break;
        case 'landscape':
            aspectRatioInstruction = 'a 16:9 landscape aspect ratio';
            break;
        case 'rectangle':
        default:
            aspectRatioInstruction = 'a 9:16 portrait aspect ratio';
            break;
    }

    const panelPrompts = script.map((panel, index) => 
        `Panel ${index + 1}:\n- Scene: ${panel.description}\n- Dialogue: "${panel.dialogue}"`
    ).join('\n\n');

    const prompt = `A single image containing a complete 3-panel comic strip.

**Aspect Ratio:** The final image must have ${aspectRatioInstruction}.

**Art Style:** ${styleInstruction}

**Overall Layout:** The comic should be laid out as ${layoutDescription} The panels must be clearly separated by thin border lines (gutters).

**Panel Content:**
${panelPrompts}

**Text Rendering Rules - CRITICAL IMPORTANCE:**
1. Text Bubbles: Include speech bubbles for dialogue.
2. Legibility: Text must be clear and legible.
3. Language: The text inside bubbles must be in ${language === 'id' ? 'Indonesian' : 'English'}.
`;

    try {
        const response = await ai.models.generateContent({
            model: imageGenModel,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
            },
        });

        const firstCandidate = response?.candidates?.[0];
        if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
                if (part.inlineData) {
                    const newMimeType = part.inlineData.mimeType;
                    const newBase64Data = part.inlineData.data;
                    return { data: `data:${newMimeType};base64,${newBase64Data}`, error: null };
                }
            }
        }
        return { data: null, error: "No image generated." };
    } catch (error) {
        console.error("Error generating comic strip:", error);
        return { data: null, error: (error as Error).message };
    }
}

export async function generateSingleComicImage(
  prompt: string,
  style: ComicStyle,
  aspectRatio: ComicAspectRatio
): Promise<{ data: string | null; error: string | null }> {
  
  const selectedStyle = COMIC_STYLE_OPTIONS.find(opt => opt.id === style);
  const styleInstruction = selectedStyle ? selectedStyle.promptInstruction : 'A standard comic book style.';

  let aspectRatioInstruction = '';
    switch (aspectRatio) {
        case 'square':
            aspectRatioInstruction = 'a 1:1 square aspect ratio';
            break;
        case 'landscape':
            aspectRatioInstruction = 'a 16:9 landscape aspect ratio';
            break;
        case 'rectangle':
        default:
            aspectRatioInstruction = 'a 9:16 portrait aspect ratio';
            break;
    }

  const finalPrompt = `Create a single, high-quality comic book illustration.

**Aspect Ratio:** The final image must have ${aspectRatioInstruction}.

**Art Style:** ${styleInstruction}

**Scene Description:**
${prompt}

**Composition:** Cinematic, dynamic, and visually striking.`;

  try {
      const response = await ai.models.generateContent({
          model: imageGenModel,
          contents: { parts: [{ text: finalPrompt }] },
          config: {
              responseModalities: [Modality.IMAGE],
              safetySettings,
          },
      });

      const firstCandidate = response?.candidates?.[0];
      if (firstCandidate?.content?.parts) {
          for (const part of firstCandidate.content.parts) {
              if (part.inlineData) {
                  const newMimeType = part.inlineData.mimeType;
                  const newBase64Data = part.inlineData.data;
                  return { data: `data:${newMimeType};base64,${newBase64Data}`, error: null };
              }
          }
      }
      return { data: null, error: "No image generated." };
  } catch (error) {
      console.error("Error generating single comic image:", error);
      return { data: null, error: (error as Error).message };
  }
}

export async function generateVideoStrategy(content: GeneratedContent, language: Language): Promise<AiStrategy | null> {
    const languageInstruction = language === 'id' 
      ? `Output HARUS dalam Bahasa Indonesia yang optimal untuk SEO YouTube/TikTok lokal.`
      : `Output MUST be in English optimized for global YouTube/TikTok SEO.`;
    
    const prompt = `
  **Mission**: You are a Video SEO Specialist.
  
  **Input Data**:
  - Headline: "${content.HEADLINE}"
  - Hook: "${content.HOOK}"
  - Climax: "${content.CLIMAX}"
  
  **Objective**: Generate optimized video metadata for YouTube Shorts and TikTok based on the content above.
  
  **JSON Output Structure**:
  {
    "optimizedTitle": "A highly clickable video title (max 60 chars)",
    "optimizedDescription": "A keyword-rich description (2-3 sentences max) optimized for the algorithm.",
    "optimizedHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
  }
  
  ${languageInstruction}
  `;
  
    try {
        const response = await ai.models.generateContent({
            model: aiSuiteModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                safetySettings,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        optimizedTitle: { type: Type.STRING },
                        optimizedDescription: { type: Type.STRING },
                        optimizedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["optimizedTitle", "optimizedDescription", "optimizedHashtags"]
                }
            }
        });
  
        const jsonString = response.text.trim();
        if (jsonString && jsonString.startsWith('{') && jsonString.endsWith('}')) {
            return JSON.parse(jsonString) as AiStrategy;
        }
        return null;
    } catch (error) {
        console.error("Error generating video strategy:", error);
        return null;
    }
}
