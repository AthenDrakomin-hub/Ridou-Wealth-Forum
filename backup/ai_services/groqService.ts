import Groq from "groq-sdk";

export class GroqService {
  private static instance: GroqService;
  private groq: Groq | null = null;

  private constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    }
  }

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  public isConnected(): boolean {
    return this.groq !== null;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('503');
      if (retries <= 0 || !isRetryable) {
        if (error.message?.includes('429')) {
          throw new Error("AI 智算配额已耗尽，请稍后再试。");
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

  /**
   * 核心对话功能
   */
  public async chat(message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
    if (!this.groq) {
      throw new Error("Groq API 未配置，请检查环境变量。");
    }

    return await this.withRetry(async () => {
      // 构建消息历史
      const messages = [
        {
          role: "system",
          content: `你是一个专业的财富管理助手，名为"日斗 AI 逻辑专家"。
你的核心任务是：
1. 分析全球核心资产（股票、债券、宏观经济）。
2. 提供深度的产业逻辑拆解。
3. 保持专业、严谨、客观的语调。
4. 使用 Markdown 格式。
5. 回答结尾必须包含免责声明："注：以上分析仅供逻辑交流，不构成投资建议。投资有风险，入市需谨慎。"`
        },
        ...history,
        { role: "user", content: message }
      ];

      const completion = await this.groq!.chat.completions.create({
        messages: messages,
        model: "llama3-70b-8192", // Groq's fastest model
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const responseText = completion.choices[0]?.message?.content || "抱歉，由于逻辑波动，暂时无法生成分析。";

      return {
        text: responseText,
        history: [...messages, { role: 'assistant', content: responseText }]
      };
    });
  }
}