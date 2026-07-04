import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Safe lazy-checking of Gemini API Key inside endpoints to prevent app crash on startup
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your secrets in the Settings panel.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route: Generate personalized NPK & Soil fertilizer recommendations
  app.post("/api/recommend", async (req, res) => {
    try {
      const ai = getGeminiClient();
      const {
        plantName,
        plantVariety = "Unknown variety",
        medium = "Soil",
        stage = "Vegetative",
        symptoms = [],
        soilType = "Loam",
        pH = "Neutral (6.5 - 7.0)",
        climate = "Moderate",
        organicPreference = "No preference",
        language = "Thanglish"
      } = req.body;

      if (!plantName) {
        return res.status(400).json({ error: "Plant name is required." });
      }

      const symptomStr = symptoms.length > 0 ? symptoms.join(", ") : "None (Healthy maintenance)";
      const isThanglish = language.toLowerCase() === "thanglish";

      const systemInstruction = `You are an elite Agronomist and Soil Science Agentic System. Your objective is to formulate a precise, highly detailed fertilizer recipe and soil adjustment dossier.
You will simulate a multi-agent framework comprising:
1. Soil Chemistry Expert: Analyzes physical medium, pH, and soil type to guarantee nutrient availability.
2. Nutrient Balancing Expert: Computes exact NPK ratio and trace mineral needs according to the growth stage.
3. Schedule & Application Planner: Designs safe, clear, non-burning dosage and application intervals.
4. Input Source Specialist: Identifies standard, accessible organic vs. synthetic options matching user preference.

${isThanglish ? 
`CRITICAL LANGUAGE REQUIREMENT: You MUST write the summary, explanations, soil chemistry analysis, recommendations, and steps/tips in natural, conversational 'Thanglish' (a combination of Tamil written using the English/Latin alphabet, and common English agricultural terms).
Examples of Thanglish:
- "Intha plant-oda growth stage-ku dynamic Nitrogen levels highly thevaipadum."
- "Fertilizer apply panrathuku munnadi substrate nalla moisture levels check pannikonga."
- "NPK ratio 10-10-10 balanced solution leaf growth boost panna use aagum."
Make sure the tone is extremely helpful, professional, botanical, yet delivered in highly fluent, natural Thanglish. Keep specific scientific terms (like Nitrogen, Phosphorus, Potassium, pH, Chlorosis, compost, fertilizer, root burn) in plain English for clarity.`
:
`CRITICAL LANGUAGE REQUIREMENT: You MUST write the entire response (including summary, explanations, soil chemistry analysis, recommendations, and steps/tips) in standard, highly professional, precise, and scientifically accurate English. Do not include any Tamil or Thanglish words in the response.`
}

Formulate an expert analysis based strictly on the provided parameters. Always reply in clean, well-structured JSON matching the requested response schema. Provide practical, accurate, scientific advice.`;

      const prompt = `Formulate a fertilizer and nutrient dossier for the following plant and environmental parameters:
- **Plant Name**: ${plantName}
- **Variety**: ${plantVariety}
- **Growth Medium**: ${medium}
- **Current Growth Stage**: ${stage}
- **Observed Symptoms**: ${symptomStr}
- **Soil Type**: ${soilType}
- **Estimated or Measured pH**: ${pH}
- **Climate/Environment**: ${climate}
- **Organic vs. Synthetic Preference**: ${organicPreference}

Draft recommendations according to this plant profile. Provide highly specific advice rather than generic guidelines. Avoid over-fertilization (nutrient burn) warnings if the plant is a heavy feeder, but emphasize balanced feeding. Make sure NPK recommendations align with the stage: (e.g. higher Nitrogen for vegetative stage, higher Phosphorus/Potassium for flowering/fruiting).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A high-level summary of the plant's growth status and nutrient requirements." },
              npkRatio: { type: Type.STRING, description: "Recommended N-P-K ratio, e.g., '10-15-10' or '5-10-5'." },
              npkExplanation: { type: Type.STRING, description: "Explanation of why this specific N-P-K ratio is recommended for this stage." },
              soilChemistry: { type: Type.STRING, description: "Soil conditions analysis, pH advice, and physical structure recommendations." },
              primaryNutrients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nutrient: { type: Type.STRING, description: "Nutrient name, i.e., 'Nitrogen (N)', 'Phosphorus (P)', or 'Potassium (K)'." },
                    status: { type: Type.STRING, description: "'Deficient' | 'Excessive' | 'Optimal' | 'Unknown'" },
                    role: { type: Type.STRING, description: "The core role of this nutrient in the current growth stage." },
                    recommendation: { type: Type.STRING, description: "Specific application advice for this nutrient." }
                  },
                  required: ["nutrient", "status", "role", "recommendation"]
                }
              },
              micronutrients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nutrient: { type: Type.STRING, description: "Nutrient name, e.g., 'Calcium (Ca)', 'Magnesium (Mg)'." },
                    importance: { type: Type.STRING, description: "Why it is critical or what deficiency symptom it addresses." },
                    remedy: { type: Type.STRING, description: "Organic or synthetic remedy to supply it." }
                  },
                  required: ["nutrient", "importance", "remedy"]
                }
              },
              fertilizerSources: {
                type: Type.OBJECT,
                properties: {
                  organic: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of organic organic inputs (e.g. bone meal, blood meal, seaweed)."
                  },
                  synthetic: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of synthetic fertilizer inputs (e.g. ammonium nitrate, superphosphate)."
                  }
                },
                required: ["organic", "synthetic"]
              },
              feedingSchedule: {
                type: Type.OBJECT,
                properties: {
                  frequency: { type: Type.STRING, description: "How often to fertilize, e.g., 'Every 10-14 days'." },
                  dosage: { type: Type.STRING, description: "Recommended dosage or strength, e.g., 'Half-strength (1/2 tsp per gallon)'." },
                  instructions: { type: Type.STRING, description: "Step-by-step application instructions (e.g., dilute, apply to soil, drench)." }
                },
                required: ["frequency", "dosage", "instructions"]
              },
              wateringAdjustments: { type: Type.STRING, description: "Watering modifications to ensure maximum fertilizer absorption and prevent nutrient lockout." },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 clear, ordered steps for the user to execute immediately."
              },
              expertTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A few specialized pro-tips for this specific plant species/variety and stage."
              }
            },
            required: [
              "summary", "npkRatio", "npkExplanation", "soilChemistry", "primaryNutrients",
              "micronutrients", "fertilizerSources", "feedingSchedule", "wateringAdjustments",
              "actionPlan", "expertTips"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Error in /api/recommend:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred." });
    }
  });

  // API Route: Interactive Chat Agent
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      const { message, chatHistory = [], context = null } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      // We format chat history for the standard generateContent call, inserting the system prompt
      const systemInstruction = `You are a helpful, extremely knowledgeable Expert Botanist and Agronomist Chat Agent.
Your duty is to answer any questions regarding plant health, nutrient deficiencies, N-P-K ratios, compost making, soil biology, soil testing, soil pH correction, and general plant care.

CRITICAL LANGUAGE REQUIREMENT (DYNAMIC ADAPTATION):
You MUST dynamically detect the language of the user's current message and previous messages:
1. If the user writes or asks in English (e.g., "how can I lower soil pH?", "what does NPK stand for?"), you MUST respond completely in natural, precise, and scientifically backed English.
2. If the user writes or asks in Thanglish/Tamil written in Latin/English alphabet (e.g., using words like "eppidi", "enga", "pannunga", "pannanum", "enna", "sollu"), you MUST respond in friendly, fluent, conversational Thanglish.
   - Thanglish examples:
     - "Hi! Unga plant-oda health condition pathi enna venum nalum kelunga, help panren!"
     - "Yellow leaves vantha general-ah Nitrogen level deficient-ah iruku nu artham."
     - "Soil pH lower panna immediate action-ah sulfur or organic peat moss mix pannunga."
     - "Fertilizer correct level-la dilute panni soil-la apply panna organic growth nalla boost aagum."

Always keep specific scientific and gardening terms (such as Nitrogen, Phosphorus, Potassium, Magnesium, pH, NPK, organic compost, fertilizer, etc.) in plain English for accuracy.
If the user asks questions unrelated to gardening, plants, or agronomy, politely bring them back to botanical topics in the detected language.
Keep your responses engaging, concise, and structured with clean bullet points or small paragraphs where helpful.`;

      // Structure historical contents
      const contents: any[] = [];
      
      // If we have current context, append it as a brief note so the model is fully context-aware
      let contextPrefix = "";
      if (context && context.plantName) {
        contextPrefix = `[Current Context: The user is currently reviewing recommendations for a "${context.plantName}" in the "${context.stage}" stage with symptoms: "${context.symptoms?.join(", ") || "none"}". Keep this plant in mind if they refer to "my plant", "this stage", or "these symptoms".]\n\n`;
      }

      // Add previous chat turns
      chatHistory.forEach((turn: { role: 'user' | 'model'; text: string }) => {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      });

      // Add the current user query with context if any
      contents.push({
        role: 'user',
        parts: [{ text: `${contextPrefix}${message}` }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred." });
    }
  });

  // Vite middleware for asset serving in dev, and static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
