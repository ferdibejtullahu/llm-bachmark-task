export interface TestCase {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'testing';
  description: string;
  prompt: string;
  expectedOutput?: string;
  evaluationCriteria: EvaluationCriterion[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
  check: (code: string) => ScoreResult;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'ollama' | 'openrouter' | 'openai' | 'custom';
  modelId: string;
  apiEndpoint?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  modelName: string;
  testCaseId: string;
  testCaseName: string;
  category: string;
  timestamp: number;
  generatedCode: string;
  latency: number;
  scores: {
    functionality: number;
    codeQuality: number;
    security: number;
    performance: number;
    accessibility?: number;
    errorHandling: number;
    overall: number;
  };
  feedback: string[];
  rawResponse: string;
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  status: 'running' | 'completed' | 'failed';
  models: string[];
  testCases: string[];
  results: BenchmarkResult[];
  progress: {
    current: number;
    total: number;
    currentModel?: string;
    currentTest?: string;
    percentComplete: number;
  };
}

export interface CategorySummary {
  category: string;
  averageScore: number;
  testCount: number;
  bestModel: string;
  scoresByModel: Record<string, number>;
}

export interface ModelPerformance {
  modelId: string;
  modelName: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  averageLatency: number;
  testResults: BenchmarkResult[];
}
