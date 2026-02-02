import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BenchmarkProgress } from '@/services/benchmarkRunner';
import { Timer, Activity, Cpu, FileCode } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: BenchmarkProgress | null;
  isRunning: boolean;
}

export function ProgressIndicator({ progress, isRunning }: ProgressIndicatorProps) {
  if (!isRunning || !progress) {
    return null;
  }

  const { current, total, currentModel, currentTest, percentComplete } = progress;

  return (
    <Card className="border-indigo-200 bg-indigo-50/50 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse text-indigo-600" />
            <CardTitle className="text-lg">Benchmark Progress</CardTitle>
          </div>
          <Badge variant="default" className="animate-pulse">
            Running
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Overall Progress</span>
            <span className="font-medium">{current} / {total} ({percentComplete}%)</span>
          </div>
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentModel && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Cpu className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Current Model</p>
                <p className="font-medium text-sm truncate">{currentModel}</p>
              </div>
            </div>
          )}
          
          {currentTest && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <FileCode className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Current Test</p>
                <p className="font-medium text-sm truncate">{currentTest}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Timer className="h-4 w-4" />
          <span>Tests are running sequentially to avoid rate limiting...</span>
        </div>
      </CardContent>
    </Card>
  );
}
