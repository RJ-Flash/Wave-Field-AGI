import { GoogleGenAI } from "@google/genai";
import { HfInference } from "@huggingface/inference";

export async function embedText(text: string): Promise<number[]> {
  let lastError;
  const safeText = typeof text === 'string' ? text.substring(0, 8000) : String(text).substring(0, 8000);

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: safeText,
      });
      return response.embeddings?.[0]?.values ?? [];
    } catch(err: any) {
      console.warn("Gemini embedding failed:", err?.message);
      lastError = err;
    }
  }
  
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      const result = await hf.featureExtraction({
        model: "Qwen/Qwen3-Embedding-8B",
        inputs: safeText,
      });
      // In HF feature extraction, the output is often a multi-dimensional array or 1D array.
      if (Array.isArray(result) && typeof result[0] === 'number') {
        return result as number[];
      } else if (Array.isArray(result) && Array.isArray(result[0])) {
        return result[0] as number[];
      }
    } catch(err: any) {
      console.warn("HF embedding failed:", err?.message);
      lastError = err;
    }
  }

  console.warn("All embedding APIs failed. Using mock zero-vector.");
  // Return a mock embedding vector (e.g., 768 dimensions of zeros)
  return new Array(768).fill(0);
}

export async function callLLM(prompt: string, role: 'fast' | 'smart'): Promise<string> {
  // 1. Try Local Ollama First
  try {
    const ollamaModel = role === 'smart' ? 'qwen3:30b-a3b' : 'llama3.2:3b';
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.response;
    }
  } catch (e) {
    // Ollama not available or timed out, gracefully fallback
  }

  // 2. Fallback to free HuggingFace API if key exists
  if (process.env.HUGGINGFACE_API_KEY) {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    const model = role === 'smart' 
      ? "deepseek-ai/DeepSeek-R1" 
      : "Qwen/Qwen3-7B-Instruct";
    
    try {
      const response = await hf.chatCompletion({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
      });
      return response.choices[0].message?.content ?? 'No response';
    } catch (e: any) {
      console.warn("HuggingFace Inference failed, falling back to Gemini...", e.message);
    }
  }

  // 3. Fallback to Gemini (Free Tier/Workspace Default)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const modelName = role === 'smart' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      return response.text ?? 'No response';
    } catch(err: any) {
      console.warn("Gemini execution failed:", err?.message);
    }
  }

  // MOCK FALLBACK for AI Studio Preview Environments lacking valid keys
  console.warn("All LLMs failed/unreachable. Using mock response.");
  
  if (prompt.includes("JSON") || prompt.includes("json")) {
    if (prompt.includes("plan")) {
       return `{"plan": [{"step": 1, "action": "Mock Setup", "expected_outcome": "Environment ready"}]}`;
    }
    return `{"tool": "complete"}`;
  }
  
  if (prompt.includes("SYNTHESIZER")) {
    return "1. Process tasks autonomously.\n2. Apply safety constraints.\n3. Conclude deployment.";
  }

  return "[Mock Response] Proceeding with simulated execution parameters safely.";
}
