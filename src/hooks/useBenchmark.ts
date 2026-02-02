import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { ModelConfig, BenchmarkResult, BenchmarkRun, TestCase } from '@/types/benchmark';
import { BenchmarkRunner, benchmarkRunner, type BenchmarkStatus, type BenchmarkProgress } from '@/services/benchmarkRunner';
import { testCases, getAllTestCases } from '@/data/testCases';
import { defaultModels } from '@/services/llmProviders';

export interface UseBenchmarkReturn {
  // State
  models: ModelConfig[];
  selectedTestCases: string[];
  status: BenchmarkStatus;
  progress: BenchmarkProgress | null;
  currentRun: BenchmarkRun | null;
  results: BenchmarkResult[];
  
  // Actions
  setModels: (models: ModelConfig[]) => void;
  toggleModel: (modelId: string) => void;
  updateModel: (modelId: string, updates: Partial<ModelConfig>) => void;
  addCustomModel: (model: Omit<ModelConfig, 'id'>) => void;
  removeCustomModel: (modelId: string) => void;
  resetModels: () => void;
  
  setSelectedTestCases: (testCaseIds: string[]) => void;
  toggleTestCase: (testCaseId: string) => void;

  selectByCategory: (category: string) => void;
  handleTestCasesChange: (testCases: TestCase[]) => void;
  
  startBenchmark: () => Promise<void>;
  stopBenchmark: () => void;
  
  exportResults: () => string;
  importResults: (json: string) => boolean;
  
  // Derived state
  enabledModelsCount: number;
  selectedTestCasesCount: number;
  totalTestsCount: number;
  isRunning: boolean;
  canStart: boolean;
}

const STORAGE_KEY_MODELS = 'benchmark_models_config';
const STORAGE_KEY_SELECTED_TESTS = 'benchmark_selected_tests';

export function useBenchmark(): UseBenchmarkReturn {
  // Initialize state from localStorage or defaults
  const [models, setModelsState] = useState<ModelConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODELS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return defaultModels;
  });
  
  const [selectedTestCases, setSelectedTestCasesState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SELECTED_TESTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return testCases.map(t => t.id);
  });
  
  const [status, setStatus] = useState<BenchmarkStatus>('idle');
  const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
  const [currentRun, setCurrentRun] = useState<BenchmarkRun | null>(null);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  
  const resultsRef = useRef<BenchmarkResult[]>([]);
  
  // Persist models to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(models));
  }, [models]);
  
  // Persist selected test cases to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SELECTED_TESTS, JSON.stringify(selectedTestCases));
  }, [selectedTestCases]);
  
  // Load existing results on mount
  useEffect(() => {
    const loaded = BenchmarkRunner.getAllResults();
    setResults(loaded);
    resultsRef.current = loaded;
  }, []);
  
  // Set up callbacks
  useEffect(() => {
    benchmarkRunner.setProgressCallback((p) => setProgress(p));
    benchmarkRunner.setStatusCallback((s) => setStatus(s));
    benchmarkRunner.setResultCallback((result) => {
      setResults(prev => {
        const updated = [...prev, result];
        resultsRef.current = updated;
        return updated;
      });
      
      // Show error toast if the result has a score of 0 and contains error feedback
      if (result.scores.overall === 0 && result.feedback.some(f => f.startsWith('Error:'))) {
        const errorMsg = result.feedback.find(f => f.startsWith('Error:'));
        toast.error(`Test failed: ${result.testCaseName}`, {
          description: errorMsg?.replace('Error: ', '') || 'Unknown error'
        });
      }
    });
  }, []);
  
  // Model management
  const setModels = useCallback((newModels: ModelConfig[]) => {
    setModelsState(newModels);
  }, []);
  
  const toggleModel = useCallback((modelId: string) => {
    setModelsState(prev => prev.map(m => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    ));
  }, []);
  
  const updateModel = useCallback((modelId: string, updates: Partial<ModelConfig>) => {
    setModelsState(prev => prev.map(m => 
      m.id === modelId ? { ...m, ...updates } : m
    ));
  }, []);
  
  const addCustomModel = useCallback((model: Omit<ModelConfig, 'id'>) => {
    const id = `custom-${Date.now()}`;
    setModelsState(prev => [...prev, { ...model, id }]);
  }, []);
  
  const removeCustomModel = useCallback((modelId: string) => {
    setModelsState(prev => prev.filter(m => m.id !== modelId));
  }, []);
  
  const resetModels = useCallback(() => {
    if (confirm('Reset all models to default configuration? This will remove any custom settings.')) {
      setModelsState(defaultModels);
      toast.success('Models reset to defaults');
    }
  }, []);
  
  // Test case selection
  const setSelectedTestCases = useCallback((testCaseIds: string[]) => {
    setSelectedTestCasesState(testCaseIds);
  }, []);
  
  const toggleTestCase = useCallback((testCaseId: string) => {
    setSelectedTestCasesState(prev => 
      prev.includes(testCaseId)
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  }, []);
  
  
  const selectByCategory = useCallback((category: string) => {
    const categoryTests = getAllTestCases().filter(t => t.category === category).map(t => t.id);
    setSelectedTestCasesState(prev => {
      const others = prev.filter(id => !categoryTests.includes(id));
      return [...others, ...categoryTests];
    });
  }, []);
  
  // Handle test cases change (when custom test cases are added/removed)
  const handleTestCasesChange = useCallback((updatedTestCases: TestCase[]) => {
    // Ensure newly added test cases are selected by default
    setSelectedTestCasesState(prev => {
      const newTestIds = updatedTestCases
        .filter(tc => tc.id.startsWith('custom-') && !prev.includes(tc.id))
        .map(tc => tc.id);
      return [...prev, ...newTestIds];
    });
  }, []);
  
  // Benchmark control
  const startBenchmark = useCallback(async () => {
    const selectedTests = getAllTestCases().filter(t => selectedTestCases.includes(t.id));
    const enabledModelsList = models.filter(m => m.enabled);
    
    if (selectedTests.length === 0 || enabledModelsList.length === 0) {
      return;
    }
    
    // Clear results before starting new benchmark
    setResults([]);
    resultsRef.current = [];
    
    const run = await benchmarkRunner.runBenchmark(enabledModelsList, selectedTests, {
      delayBetweenRequests: 500,
      continueOnError: true
    });
    
    setCurrentRun(run);
  }, [models, selectedTestCases]);
  
  const stopBenchmark = useCallback(() => {
    benchmarkRunner.stopBenchmark();
  }, []);
  
  // Utility functions

  
  const exportResults = useCallback(() => {
    return BenchmarkRunner.exportResults();
  }, []);
  
  const importResults = useCallback((json: string) => {
    const success = BenchmarkRunner.importResults(json);
    if (success) {
      const loaded = BenchmarkRunner.getAllResults();
      setResults(loaded);
      resultsRef.current = loaded;
    }
    return success;
  }, []);
  
  // Derived state
  const enabledModelsCount = models.filter(m => m.enabled).length;
  const selectedTestCasesCount = selectedTestCases.length;
  const totalTestsCount = enabledModelsCount * selectedTestCasesCount;
  const isRunning = status === 'running';
  const canStart = enabledModelsCount > 0 && selectedTestCasesCount > 0 && !isRunning;
  
  return {
    models,
    selectedTestCases,
    status,
    progress,
    currentRun,
    results,
    
    setModels,
    toggleModel,
    updateModel,
    addCustomModel,
    removeCustomModel,
    resetModels,
    
    setSelectedTestCases,
    toggleTestCase,
    selectByCategory,
    handleTestCasesChange,
    
    startBenchmark,
    stopBenchmark,
    
    exportResults,
    importResults,
    
    enabledModelsCount,
    selectedTestCasesCount,
    totalTestsCount,
    isRunning,
    canStart
  };
}
