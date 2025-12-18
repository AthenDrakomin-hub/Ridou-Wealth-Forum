
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes('429') || error.message?.includes('quota');
      if (retries <= 0 || !isRetryable) {
        if (error.message?.includes('429')) {
          throw new Error("AI 智算配额已耗尽，请稍后再试或检查 API 账单。");
        }
        if (error.message?.includes('API_KEY_MISSING')) {
          throw new Error("检测到密钥配置缺失，请在环境设置中配置有效 API_KEY。");
        }
        if (!navigator.onLine) {
          throw new Error("网络似乎已断开，请检查网络连接。");
        }
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }

  public async chat(history: { role: 'user' | 'model'; parts: { text: string }[] }[]) {
    // API_KEY is provided via process.env.API_KEY
    return await this.withRetry(async () => {
      // Fix: Create a new GoogleGenAI instance right before making an API call to ensure latest key usage.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Fix: Upgrade to 'gemini-3-pro-image-preview' as it is required when using the googleSearch tool.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: history,
        config: {
          systemInstruction: '你是一个专业的财富管理助手。你拥有实时搜索能力，请结合最新的市场数据回答。回答结尾请始终提醒“投资有风险”。',
          tools: [{ googleSearch: {} }] // Only googleSearch is permitted here.
        }
      });

      // Fix: Access .text property directly (it's a getter, not a method).
      const text = response.text || "未能生成分析。";
      // Fix: Extract website URLs from groundingChunks for search grounding transparency.
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks && chunks.length > 0) {
        const sources = chunks
          .filter(c => c.web)
          .map(c => `[${c.web.title}](${c.web.uri})`)
          .join(', ');
        return `${text}\n\n**实时参考来源：**\n${sources}`;
      }

      return text;
    });
  }
}
