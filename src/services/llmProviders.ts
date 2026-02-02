import type { ModelConfig } from '@/types/benchmark';

export interface LLMResponse {
  code: string;
  rawResponse: string;
  latency: number;
  tokensUsed?: number;
}

export interface LLMProvider {
  generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse>;
  checkAvailability(config: ModelConfig): Promise<boolean>;
}

// Ollama Provider (Local LLMs)
class OllamaProvider implements LLMProvider {
  async generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse> {
    const startTime = Date.now();
    const endpoint = config.apiEndpoint || 'http://localhost:11434';
    
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.modelId,
        prompt: `You are a code generation assistant. Generate clean, production-ready code based on the following requirements. Only output the code without explanations unless specifically asked.

${prompt}`,
        stream: false,
        options: {
          temperature: config.temperature ?? 0.2,
          num_predict: config.maxTokens ?? 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    // Extract code from markdown code blocks if present
    const rawResponse = data.response || '';
    const code = extractCodeFromMarkdown(rawResponse);
    
    return {
      code,
      rawResponse,
      latency,
      tokensUsed: data.eval_count
    };
  }

  async checkAvailability(config: ModelConfig): Promise<boolean> {
    try {
      const endpoint = config.apiEndpoint || 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/tags`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.models || [];
      return models.some((m: any) => m.name === config.modelId || m.model === config.modelId);
    } catch {
      return false;
    }
  }
}

// OpenRouter Provider (Cloud LLMs)
class OpenRouterProvider implements LLMProvider {
  async generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = config.apiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
    
    console.log('🔑 OpenRouter API Key present:', !!apiKey);
    console.log('📤 Calling OpenRouter with model:', config.modelId);
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LLM Code Gen Benchmark'
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: [
          {
            role: 'system',
            content: 'You are a code generation assistant. Generate clean, production-ready code. Only output the code without explanations unless specifically asked.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens ?? 2048
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenRouter API error:', response.status, error);
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    console.log('✅ OpenRouter response received. Latency:', latency + 'ms');
    
    const rawResponse = data.choices?.[0]?.message?.content || '';
    const code = extractCodeFromMarkdown(rawResponse);
    
    return {
      code,
      rawResponse,
      latency,
      tokensUsed: data.usage?.total_tokens
    };
  }

  async checkAvailability(config: ModelConfig): Promise<boolean> {
    const apiKey = config.apiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return false;
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.data || [];
      return models.some((m: any) => m.id === config.modelId);
    } catch {
      return false;
    }
  }
}

// OpenAI Compatible Provider (Generic)
class OpenAIProvider implements LLMProvider {
  async generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = config.apiEndpoint || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: [
          {
            role: 'system',
            content: 'You are a code generation assistant. Generate clean, production-ready code. Only output the code without explanations unless specifically asked.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens ?? 2048
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    const rawResponse = data.choices?.[0]?.message?.content || '';
    const code = extractCodeFromMarkdown(rawResponse);
    
    return {
      code,
      rawResponse,
      latency,
      tokensUsed: data.usage?.total_tokens
    };
  }

  async checkAvailability(config: ModelConfig): Promise<boolean> {
    const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return false;
    
    try {
      const endpoint = config.apiEndpoint || 'https://api.openai.com/v1';
      const response = await fetch(`${endpoint}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.data || [];
      return models.some((m: any) => m.id === config.modelId);
    } catch {
      return false;
    }
  }
}

// Custom Provider (User-defined endpoint)
class CustomProvider implements LLMProvider {
  async generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse> {
    const startTime = Date.now();
    
    if (!config.apiEndpoint) {
      throw new Error('Custom provider requires an API endpoint');
    }

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        model: config.modelId,
        prompt: `You are a code generation assistant. Generate clean, production-ready code based on the following requirements. Only output the code without explanations unless specifically asked.

${prompt}`,
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens ?? 2048
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    // Try to extract response from common formats
    const rawResponse = data.response || data.text || data.content || data.choices?.[0]?.message?.content || JSON.stringify(data);
    const code = extractCodeFromMarkdown(rawResponse);
    
    return {
      code,
      rawResponse,
      latency,
      tokensUsed: data.tokens_used || data.usage?.total_tokens
    };
  }

  async checkAvailability(config: ModelConfig): Promise<boolean> {
    if (!config.apiEndpoint) return false;
    
    try {
      const response = await fetch(config.apiEndpoint.replace('/generate', '/health').replace('/completions', '/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      // Try a simple POST as fallback
      return true; // Assume available if endpoint is set
    }
  }
}

// Helper function to extract code from markdown
function extractCodeFromMarkdown(text: string): string {
  if (!text) return '';
  
  // Match code blocks with language specifier
  const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/g;
  const matches = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  
  if (matches.length > 0) {
    return matches.join('\n\n');
  }
  
  // If no code blocks found, return the whole text
  return text.trim();
}

// Provider factory
export function getProvider(providerType: string): LLMProvider {
  switch (providerType) {
    case 'ollama':
      return new OllamaProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'custom':
      return new CustomProvider();
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
}

// Default model configurations
export const defaultModels: ModelConfig[] = [
  {
    id: 'codellama',
    name: 'CodeLlama 7B (Ollama)',
    provider: 'ollama',
    modelId: 'codellama:7b',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  {
    id: 'mistral',
    name: 'Mistral 7B (Ollama)',
    provider: 'ollama',
    modelId: 'mistral:7b',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  {
    id: 'llama3',
    name: 'Llama 3 8B (Ollama)',
    provider: 'ollama',
    modelId: 'llama3:8b',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder 6.7B (Ollama)',
    provider: 'ollama',
    modelId: 'deepseek-coder:6.7b',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  {
    id: 'qwen2.5-coder',
    name: 'Qwen 2.5 Coder 7B (Ollama)',
    provider: 'ollama',
    modelId: 'qwen2.5-coder:7b',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  {
    id: 'phi4',
    name: 'Phi-4 (Ollama)',
    provider: 'ollama',
    modelId: 'phi4',
    temperature: 0.2,
    maxTokens: 2048,
    enabled: false
  },
  // OpenRouter Models (require API key)
  {
    id: 'codestral-2508',
    name: 'Codestral 2508 (OpenRouter)',
    provider: 'openrouter',
    modelId: 'mistralai/codestral-2508',
    temperature: 0.2,
    maxTokens: 4096,
    enabled: false
  },
  {
    id: 'qwen3-coder-flash',
    name: 'Qwen3 Coder Flash (OpenRouter)',
    provider: 'openrouter',
    modelId: 'qwen/qwen3-coder-flash',
    temperature: 0.2,
    maxTokens: 4096,
    enabled: false
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral Nemo 12B (OpenRouter)',
    provider: 'openrouter',
    modelId: 'mistralai/mistral-nemo',
    temperature: 0.2,
    maxTokens: 4096,
    enabled: false
  },
  {
    id: 'ministral-3b',
    name: 'Ministral 3B (OpenRouter)',
    provider: 'openrouter',
    modelId: 'mistralai/ministral-3b',
    temperature: 0.2,
    maxTokens: 4096,
    enabled: false
  }
];

// Check which models are available
export async function checkModelAvailability(models: ModelConfig[]): Promise<ModelConfig[]> {
  const results = await Promise.all(
    models.map(async (model) => {
      try {
        const provider = getProvider(model.provider);
        const available = await provider.checkAvailability(model);
        return { ...model, enabled: available };
      } catch {
        return { ...model, enabled: false };
      }
    })
  );
  return results;
}
