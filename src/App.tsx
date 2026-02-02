import { useCallback, useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useBenchmark } from '@/hooks/useBenchmark';
import { DashboardHeader } from '@/sections/DashboardHeader';
import { ModelConfiguration } from '@/sections/ModelConfiguration';
import { TestCaseSelection } from '@/sections/TestCaseSelection';
import { ProgressIndicator } from '@/sections/ProgressIndicator';
import { ResultsVisualization } from '@/sections/ResultsVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cpu, 
  TestTube, 
  BarChart3, 
  Settings, 
  Info,
  CheckCircle2,
  AlertCircle,
  Terminal
} from 'lucide-react';

function App() {
  const {
    models,
    selectedTestCases,
    status,
    progress,
    results,
    
    toggleModel,
    updateModel,
    resetModels,
    
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
  } = useBenchmark();

  const [activeTab, setActiveTab] = useState('configure');
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const handleStart = useCallback(async () => {
    try {
      const toastId = toast.loading('Starting benchmark...');
      setLoadingToastId(toastId);
      
      const run = await startBenchmark();
      
      toast.dismiss(toastId);
      setLoadingToastId(null);
      
      if (run.status === 'completed') {
        toast.success('Benchmark completed!');
      }
      
      setActiveTab('results');
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
      toast.error(`Benchmark failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to start benchmark:', error);
    }
  }, [startBenchmark, loadingToastId]);

  // Dismiss loading toast when benchmark is stopped
  useEffect(() => {
    if (loadingToastId && status === 'idle') {
      toast.dismiss(loadingToastId);
      setLoadingToastId(null);
      toast.info('Benchmark stopped');
    }
  }, [status, loadingToastId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Terminal className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LLM Code Gen Benchmark</h1>
                <p className="text-xs text-slate-500">
                  Evaluate open-source LLMs on code generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {enabledModelsCount} Models
              </Badge>
              <Badge variant="outline" className="hidden sm:inline-flex">
                <TestTube className="h-3 w-3 mr-1" />
                {selectedTestCasesCount} Tests
              </Badge>
              {results.length > 0 && (
                <Badge variant="secondary">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {results.length} Results
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <DashboardHeader
              status={status}
              canStart={canStart}
              enabledModelsCount={enabledModelsCount}
              selectedTestCasesCount={selectedTestCasesCount}
              totalTestsCount={totalTestsCount}
              onStart={handleStart}
              onStop={stopBenchmark}
            />
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <ProgressIndicator progress={progress} isRunning={isRunning} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">
              <Settings className="h-4 w-4 mr-2" /> Configure
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart3 className="h-4 w-4 mr-2" /> Results
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="h-4 w-4 mr-2" /> About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModelConfiguration
                models={models}
                onToggleModel={toggleModel}
                onUpdateModel={updateModel}
                onResetModels={resetModels}
              />
              <TestCaseSelection
                selectedTestCases={selectedTestCases}
                onToggleTestCase={toggleTestCase}
                onSelectByCategory={selectByCategory}
                onTestCasesChange={handleTestCasesChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="results">
            <ResultsVisualization results={results} />
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About LLM Code Gen Benchmark</h2>
                  <p className="text-slate-600 leading-relaxed">
                    This benchmark evaluates open-source Large Language Models (LLMs) on their code generation 
                    capabilities across three critical domains: Frontend Development, Backend Development, and 
                    Test Case Generation. The goal is to identify which models perform best for specific 
                    coding tasks and provide actionable insights for developers.
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg w-fit">
                      <Cpu className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Supported Models</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Ollama: CodeLlama 7B</li>
                      <li>• Ollama: DeepSeek Coder 6.7B</li>
                      <li>• Ollama: Qwen2.5 Coder 7B</li>
                      <li>• OpenRouter: Codestral 2508</li>
                      <li>• OpenRouter: Qwen3 Coder Flash</li>
                      <li>• OpenRouter: Mistral Nemo 12B</li>
                      <li>• OpenRouter: Ministral 3B</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg w-fit">
                      <TestTube className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Test Categories</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Frontend: React components, hooks, forms</li>
                      <li>• Backend: APIs, auth, database, WebSockets</li>
                      <li>• Testing: Unit, integration, E2E tests</li>
                      <li>• 15 comprehensive test cases</li>
                      <li>• Difficulty: Easy to Hard</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg w-fit">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Evaluation Criteria</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Functionality (25%)</li>
                      <li>• Code Quality (20%)</li>
                      <li>• Security (20%)</li>
                      <li>• Performance (15%)</li>
                      <li>• Accessibility (10%)</li>
                      <li>• Error Handling (10%)</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Getting Started</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong>1. Configure Models:</strong> Enable the models you want to test. For local models, ensure Ollama is running.</p>
                    <p><strong>2. Select Test Cases:</strong> Choose which tests to run across Frontend, Backend, and Testing categories.</p>
                    <p><strong>3. Run Benchmark:</strong> Click "Start Benchmark" to begin evaluation. Results will appear in real-time.</p>
                    <p><strong>4. Analyze Results:</strong> View charts and detailed breakdowns to compare model performance.</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="font-medium text-slate-900 mb-1">Note on Local Models</p>
                    <p>
                      For local model evaluation via Ollama, ensure you have Ollama installed and running 
                      on your machine. Pull the models you want to test using{' '}
                      <code className="bg-white px-1 py-0.5 rounded border">ollama pull {'<model>'}</code>.
                      The benchmark will automatically detect available models.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>LLM Code Generation Benchmark</p>
            <p>Built with React, TypeScript & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
