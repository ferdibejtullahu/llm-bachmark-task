import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square } from 'lucide-react';
import type { BenchmarkStatus } from '@/services/benchmarkRunner';

interface DashboardHeaderProps {
  status: BenchmarkStatus;
  canStart: boolean;
  enabledModelsCount: number;
  selectedTestCasesCount: number;
  totalTestsCount: number;
  onStart: () => void;
  onStop: () => void;
}

export function DashboardHeader({
  status,
  canStart,
  enabledModelsCount,
  selectedTestCasesCount,
  totalTestsCount,
  onStart,
  onStop
}: DashboardHeaderProps) {
  const isRunning = status === 'running';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LLM Code Gen Benchmark</h1>
          <p className="text-slate-500 mt-1">
            Evaluate and compare open-source LLMs on code generation capabilities
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-100 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {enabledModelsCount} Models
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {selectedTestCasesCount} Tests
          </Badge>
          <Badge variant="outline" className="text-sm">
            {totalTestsCount} Total Runs
          </Badge>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={onStart}
              disabled={!canStart}
            >
              <Play className="h-4 w-4 mr-2" /> Start Benchmark
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
