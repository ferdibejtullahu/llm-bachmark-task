import type { BenchmarkRun, BenchmarkResult, TestCase, ModelConfig } from '@/types/benchmark';
import { getProvider } from './llmProviders';
import { evaluateCode, generateFeedback } from './evaluationEngine';

export type BenchmarkStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface BenchmarkProgress {
  current: number;
  total: number;
  currentModel?: string;
  currentTest?: string;
  percentComplete: number;
}

export class BenchmarkRunner {
  private currentRun: BenchmarkRun | null = null;
  private status: BenchmarkStatus = 'idle';
  private progressCallback?: (progress: BenchmarkProgress) => void;
  private resultCallback?: (result: BenchmarkResult) => void;
  private statusCallback?: (status: BenchmarkStatus) => void;
  private abortController: AbortController | null = null;
  private pausedState: {
    models: ModelConfig[];
    testCases: TestCase[];
    currentModelIndex: number;
    currentTestIndex: number;
    options: any;
  } | null = null;

  setProgressCallback(callback: (progress: BenchmarkProgress) => void) {
    this.progressCallback = callback;
  }

  setResultCallback(callback: (result: BenchmarkResult) => void) {
    this.resultCallback = callback;
  }

  setStatusCallback(callback: (status: BenchmarkStatus) => void) {
    this.statusCallback = callback;
  }

  private updateStatus(status: BenchmarkStatus) {
    this.status = status;
    this.statusCallback?.(status);
  }

  private updateProgress(progress: BenchmarkProgress) {
    this.progressCallback?.(progress);
  }

  getStatus(): BenchmarkStatus {
    return this.status;
  }

  getCurrentRun(): BenchmarkRun | null {
    return this.currentRun;
  }

  async runBenchmark(
    models: ModelConfig[],
    testCases: TestCase[],
    options: {
      delayBetweenRequests?: number;
      continueOnError?: boolean;
    } = {}
  ): Promise<BenchmarkRun> {
    const { delayBetweenRequests = 1000, continueOnError = true } = options;
    
    console.log('🚀 Starting benchmark with:', { models: models.length, testCases: testCases.length });
    
    // Filter enabled models
    const enabledModels = models.filter(m => m.enabled);
    console.log('✅ Enabled models:', enabledModels.map(m => m.name));
    
    if (enabledModels.length === 0) {
      throw new Error('No enabled models to benchmark');
    }

    // Initialize benchmark run
    const runId = `run-${Date.now()}`;
    const totalTests = enabledModels.length * testCases.length;
    
    console.log('📊 Total tests calculation:', {
      enabledModels: enabledModels.length,
      testCases: testCases.length,
      totalTests
    });
    
    this.currentRun = {
      id: runId,
      timestamp: Date.now(),
      status: 'running',
      models: enabledModels.map(m => m.id),
      testCases: testCases.map(t => t.id),
      results: [],
      progress: {
        current: 0,
        total: totalTests,
        currentModel: undefined,
        currentTest: undefined,
        percentComplete: 0
      }
    };

    this.abortController = new AbortController();
    this.updateStatus('running');

    let currentTestIndex = 0;
    const run = this.currentRun; // Local reference for type safety

    try {
      for (let modelIndex = 0; modelIndex < enabledModels.length; modelIndex++) {
        const model = enabledModels[modelIndex];
        
        if (this.abortController.signal.aborted) {
          // Save state for resume
          this.pausedState = {
            models: enabledModels,
            testCases,
            currentModelIndex: modelIndex,
            currentTestIndex,
            options
          };
          break;
        }

        for (let testIndex = 0; testIndex < testCases.length; testIndex++) {
          const testCase = testCases[testIndex];
          
          if (this.abortController.signal.aborted) {
            // Save state for resume
            this.pausedState = {
              models: enabledModels,
              testCases,
              currentModelIndex: modelIndex,
              currentTestIndex,
              options
            };
            break;
          }

          currentTestIndex++;
          
          // Update progress
          run.progress = {
            current: currentTestIndex,
            total: totalTests,
            currentModel: model.name,
            currentTest: testCase.name,
            percentComplete: Math.round((currentTestIndex / totalTests) * 100)
          };
          this.updateProgress(run.progress);

          try {
            console.log(`⚡ Running test: ${testCase.name} with model: ${model.name}`);
            
            // Run single test
            const result = await this.runSingleTest(model, testCase);
            
            console.log(`✓ Test completed. Score: ${result.scores.overall}`);
            
            // Add to results
            run.results.push(result);
            this.resultCallback?.(result);

            // Save to localStorage
            this.saveResult(result);

          } catch (error) {
            console.error(`Error running test ${testCase.id} with model ${model.id}:`, error);
            
            // Create error result
            const errorResult: BenchmarkResult = {
              id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              modelId: model.id,
              modelName: model.name,
              testCaseId: testCase.id,
              testCaseName: testCase.name,
              category: testCase.category,
              timestamp: Date.now(),
              generatedCode: '',
              latency: 0,
              scores: {
                functionality: 0,
                codeQuality: 0,
                security: 0,
                performance: 0,
                accessibility: 0,
                errorHandling: 0,
                overall: 0
              },
              feedback: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
              rawResponse: ''
            };
            
            run.results.push(errorResult);
            this.resultCallback?.(errorResult);

            if (!continueOnError) {
              throw error;
            }
          }

          // Delay between requests to avoid rate limiting
          if (delayBetweenRequests > 0 && currentTestIndex < totalTests) {
            await this.sleep(delayBetweenRequests);
          }
        }
      }

      run.status = 'completed';
      this.updateStatus('completed');
      this.pausedState = null; // Clear paused state on completion
      
      // Save run summary
      this.saveRunSummary(run);

    } catch (error) {
      run.status = 'failed';
      this.updateStatus('failed');
      this.pausedState = null; // Clear paused state on failure
      console.error('Benchmark failed:', error);
    }

    return run;
  }

  private async continueFromPausedState(): Promise<void> {
    if (!this.pausedState || !this.currentRun) return;

    const { models, testCases, currentModelIndex, currentTestIndex, options } = this.pausedState;
    const { delayBetweenRequests = 1000, continueOnError = true } = options;
    const totalTests = models.length * testCases.length;
    const run = this.currentRun;

    let testCounter = currentTestIndex;

    try {
      for (let modelIndex = currentModelIndex; modelIndex < models.length; modelIndex++) {
        const model = models[modelIndex];
        
        if (this.abortController?.signal.aborted) {
          this.pausedState.currentModelIndex = modelIndex;
          this.pausedState.currentTestIndex = testCounter;
          break;
        }

        // Start from the test we left off at (only for the first model in resume)
        const startTestIndex = modelIndex === currentModelIndex 
          ? (currentTestIndex % testCases.length) 
          : 0;

        for (let testIndex = startTestIndex; testIndex < testCases.length; testIndex++) {
          const testCase = testCases[testIndex];
          
          if (this.abortController?.signal.aborted) {
            this.pausedState.currentModelIndex = modelIndex;
            this.pausedState.currentTestIndex = testCounter;
            break;
          }

          testCounter++;

          // Update progress
          run.progress = {
            current: testCounter,
            total: totalTests,
            currentModel: model.name,
            currentTest: testCase.name,
            percentComplete: Math.round((testCounter / totalTests) * 100)
          };
          this.updateProgress(run.progress);

          try {
            console.log(`⚡ Running test: ${testCase.name} with model: ${model.name}`);
            
            const result = await this.runSingleTest(model, testCase);
            
            console.log(`✓ Test completed. Score: ${result.scores.overall}`);
            
            run.results.push(result);
            this.resultCallback?.(result);
            this.saveResult(result);

          } catch (error) {
            console.error(`Error running test ${testCase.id} with model ${model.id}:`, error);
            
            const errorResult: BenchmarkResult = {
              id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              modelId: model.id,
              modelName: model.name,
              testCaseId: testCase.id,
              testCaseName: testCase.name,
              category: testCase.category,
              timestamp: Date.now(),
              generatedCode: '',
              latency: 0,
              scores: {
                functionality: 0,
                codeQuality: 0,
                security: 0,
                performance: 0,
                accessibility: 0,
                errorHandling: 0,
                overall: 0
              },
              feedback: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
              rawResponse: ''
            };
            
            run.results.push(errorResult);
            this.resultCallback?.(errorResult);

            if (!continueOnError) {
              throw error;
            }
          }

          if (delayBetweenRequests > 0 && testCounter < totalTests) {
            await this.sleep(delayBetweenRequests);
          }
        }
      }

      run.status = 'completed';
      this.updateStatus('completed');
      this.pausedState = null;
      this.saveRunSummary(run);

    } catch (error) {
      run.status = 'failed';
      this.updateStatus('failed');
      this.pausedState = null;
      console.error('Benchmark failed:', error);
    }
  }

  private async runSingleTest(
    model: ModelConfig,
    testCase: TestCase
  ): Promise<BenchmarkResult> {
    const provider = getProvider(model.provider);
    
    // Generate code
    const response = await provider.generateCode(testCase.prompt, model);
    
    // Evaluate the generated code
    const evaluation = evaluateCode(response.code, testCase, response.rawResponse);
    const feedback = generateFeedback(evaluation);
    
    // Create result
    const result: BenchmarkResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modelId: model.id,
      modelName: model.name,
      testCaseId: testCase.id,
      testCaseName: testCase.name,
      category: testCase.category,
      timestamp: Date.now(),
      generatedCode: response.code,
      latency: response.latency,
      scores: evaluation.scores,
      feedback: feedback,
      rawResponse: response.rawResponse
    };

    return result;
  }

  pauseBenchmark() {
    if (this.status === 'running') {
      this.abortController?.abort();
      this.updateStatus('idle');
      if (this.currentRun) {
        this.currentRun.status = 'failed';
      }
    }
  }

  async resumeBenchmark() {
    if (this.pausedState && this.currentRun) {
      this.abortController = new AbortController();
      this.updateStatus('running');
      this.currentRun.status = 'running';
      
      // Continue from where we left off
      await this.continueFromPausedState();
    }
  }

  stopBenchmark() {
    this.pausedState = null;
    this.abortController?.abort();
    this.updateStatus('idle');
    if (this.currentRun) {
      this.currentRun.status = 'completed';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Storage methods
  private saveResult(result: BenchmarkResult) {
    try {
      const key = `benchmark_results_${result.modelId}`;
      const existing = localStorage.getItem(key);
      const results: BenchmarkResult[] = existing ? JSON.parse(existing) : [];
      results.push(result);
      localStorage.setItem(key, JSON.stringify(results));
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  }

  private saveRunSummary(run: BenchmarkRun) {
    try {
      const key = 'benchmark_runs';
      const existing = localStorage.getItem(key);
      const runs: BenchmarkRun[] = existing ? JSON.parse(existing) : [];
      runs.push(run);
      localStorage.setItem(key, JSON.stringify(runs));
    } catch (error) {
      console.error('Failed to save run summary:', error);
    }
  }

  // Static methods for retrieving stored data
  static getResultsForModel(modelId: string): BenchmarkResult[] {
    try {
      const key = `benchmark_results_${modelId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getAllResults(): BenchmarkResult[] {
    try {
      const results: BenchmarkResult[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('benchmark_results_')) {
          const data = localStorage.getItem(key);
          if (data) {
            results.push(...JSON.parse(data));
          }
        }
      }
      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  static getBenchmarkRuns(): BenchmarkRun[] {
    try {
      const data = localStorage.getItem('benchmark_runs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearAllData() {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('benchmark_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  static exportResults(): string {
    const results = this.getAllResults();
    const runs = this.getBenchmarkRuns();
    return JSON.stringify({ results, runs, exportedAt: new Date().toISOString() }, null, 2);
  }

  static importResults(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.results && Array.isArray(data.results)) {
        // Group results by model
        const byModel: Record<string, BenchmarkResult[]> = {};
        data.results.forEach((r: BenchmarkResult) => {
          if (!byModel[r.modelId]) byModel[r.modelId] = [];
          byModel[r.modelId].push(r);
        });
        
        // Save to localStorage
        Object.entries(byModel).forEach(([modelId, results]) => {
          localStorage.setItem(`benchmark_results_${modelId}`, JSON.stringify(results));
        });
      }
      
      if (data.runs && Array.isArray(data.runs)) {
        localStorage.setItem('benchmark_runs', JSON.stringify(data.runs));
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const benchmarkRunner = new BenchmarkRunner();
