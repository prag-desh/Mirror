import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  // Set response headers first
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    // Parse request body
    const { input } = req.body;
    
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Input is required" });
    }
    
    // Check API key
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing" });
    }
    
    console.log("Processing decode request:", input.substring(0, 100) + "...");
    
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Mirror"
      },
      timeout: 15000
    });
    
    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: `You are a clinical psychologist. Analyze the emotional situation and return JSON with these fields: patternName, explanation, action, whatToSay, hiddenNeed, confidenceNote, goDeeper, sayDifferently, coreTrigger, mechanism, shareInsight, safetyFlag, disclaimer.`
        },
        {
          role: "user",
          content: `Analyze this emotional situation: ${input}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content;
    
    if (!content) {
      return res.status(502).json({ error: "Model returned no usable content" });
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(502).json({ error: "Model returned invalid JSON" });
    }
    
    const result = {
      patternName: parsed.patternName || "Unknown Pattern",
      explanation: parsed.explanation || "No explanation provided",
      action: parsed.action || "No action provided",
      coreTrigger: parsed.coreTrigger || "Unknown trigger",
      mechanism: parsed.mechanism || "Unknown mechanism",
      shareInsight: parsed.shareInsight || "",
      safetyFlag: parsed.safetyFlag || false,
      disclaimer: parsed.disclaimer || "This is not a substitute for professional mental health support.",
      // Add missing fields that Results page expects
      whatToSay: parsed.whatToSay || "I understand you're feeling this way. Let's talk about what's really going on.",
      hiddenNeed: parsed.hiddenNeed || "You need to feel heard and validated in your experience.",
      confidenceNote: parsed.confidenceNote || "This pattern is commonly seen in similar situations.",
      goDeeper: parsed.goDeeper || "Let's explore what triggers this response in your daily life.",
      sayDifferently: parsed.sayDifferently || "Another way to express this might be: \"I'm struggling with...\""
    };
    
    console.log("Successfully decoded pattern:", result.patternName);
    res.json(result);
    
  } catch (error) {
    console.error("API error:", error);
    
    if (error.message.includes("timeout") || error.name === "AbortError") {
      return res.status(504).json({ error: "Model request timed out" });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
