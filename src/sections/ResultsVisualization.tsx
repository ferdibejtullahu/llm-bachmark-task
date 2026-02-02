import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BenchmarkResult } from '@/types/benchmark';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Code, ChevronDown, ChevronUp, BarChart3, Table as TableIcon } from 'lucide-react';

interface ResultsVisualizationProps {
  results: BenchmarkResult[];
}

export function ResultsVisualization({ results }: ResultsVisualizationProps) {
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (results.length === 0) return null;

    const byModel: Record<string, { 
      modelName: string;
      results: BenchmarkResult[];
      avgScore: number;
      avgLatency: number;
      categoryScores: Record<string, number[]>;
    }> = {};

    results.forEach(r => {
      if (!byModel[r.modelId]) {
        byModel[r.modelId] = {
          modelName: r.modelName,
          results: [],
          avgScore: 0,
          avgLatency: 0,
          categoryScores: {}
        };
      }
      byModel[r.modelId].results.push(r);
      
      if (!byModel[r.modelId].categoryScores[r.category]) {
        byModel[r.modelId].categoryScores[r.category] = [];
      }
      byModel[r.modelId].categoryScores[r.category].push(r.scores.overall);
    });

    // Calculate averages
    Object.values(byModel).forEach(model => {
      model.avgScore = model.results.reduce((sum, r) => sum + r.scores.overall, 0) / model.results.length;
      model.avgLatency = model.results.reduce((sum, r) => sum + r.latency, 0) / model.results.length;
      
      Object.keys(model.categoryScores).forEach(cat => {
        const scores = model.categoryScores[cat];
        model.categoryScores[cat] = [scores.reduce((a, b) => a + b, 0) / scores.length];
      });
    });

    const sortedModels = Object.values(byModel).sort((a, b) => b.avgScore - a.avgScore);
    
    return {
      byModel,
      sortedModels,
      totalTests: results.length,
      avgScore: results.reduce((sum, r) => sum + r.scores.overall, 0) / results.length,
      avgLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length
    };
  }, [results]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!summary) return [];
    
    return summary.sortedModels.map(m => ({
      name: m.modelName.split('(')[0].trim(),
      overall: Math.round(m.avgScore),
      functionality: Math.round(m.results.reduce((sum, r) => sum + r.scores.functionality, 0) / m.results.length),
      codeQuality: Math.round(m.results.reduce((sum, r) => sum + r.scores.codeQuality, 0) / m.results.length),
      security: Math.round(m.results.reduce((sum, r) => sum + r.scores.security, 0) / m.results.length),
      performance: Math.round(m.results.reduce((sum, r) => sum + r.scores.performance, 0) / m.results.length),
      accessibility: Math.round(m.results.reduce((sum, r) => sum + (r.scores.accessibility || 0), 0) / m.results.length),
      errorHandling: Math.round(m.results.reduce((sum, r) => sum + r.scores.errorHandling, 0) / m.results.length),
      latency: Math.round(m.avgLatency)
    }));
  }, [summary]);

  // Prepare radar data
  const radarData = useMemo(() => {
    if (!summary || summary.sortedModels.length === 0) return [];
    
    const metrics = ['functionality', 'codeQuality', 'security', 'performance', 'accessibility', 'errorHandling'];
    
    return metrics.map(metric => {
      const dataPoint: Record<string, any> = {
        metric: metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      };
      
      summary.sortedModels.slice(0, 3).forEach(model => {
        const avgScore = model.results.reduce((sum, r) => sum + (r.scores as any)[metric], 0) / model.results.length;
        dataPoint[model.modelName.split('(')[0].trim()] = Math.round(avgScore);
      });
      
      return dataPoint;
    });
  }, [summary]);

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No results yet. Start a benchmark to see results.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <CardTitle className="text-lg">Results</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'charts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('charts')}
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Charts
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4 mr-2" /> Table
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500">Total Tests</p>
              <p className="text-2xl font-bold">{summary.totalTests}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500">Models Tested</p>
              <p className="text-2xl font-bold">{summary.sortedModels.length}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500">Avg Score</p>
              <p className="text-2xl font-bold">{Math.round(summary.avgScore)}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500">Avg Latency</p>
              <p className="text-2xl font-bold">{Math.round(summary.avgLatency)}ms</p>
            </div>
          </div>
        )}

        {viewMode === 'charts' ? (
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overall">Overall Scores</TabsTrigger>
              <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overall" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="overall" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="breakdown" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="functionality" stackId="a" fill="#4f46e5" />
                    <Bar dataKey="codeQuality" stackId="a" fill="#10b981" />
                    <Bar dataKey="security" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="performance" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="errorHandling" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="radar" className="mt-4">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {summary?.sortedModels.slice(0, 3).map((model, idx) => (
                      <Radar
                        key={model.modelName}
                        name={model.modelName.split('(')[0].trim()}
                        dataKey={model.modelName.split('(')[0].trim()}
                        stroke={['#4f46e5', '#10b981', '#f59e0b'][idx]}
                        fill={['#4f46e5', '#10b981', '#f59e0b'][idx]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <>
                    <TableRow key={result.id} className={result.scores.overall === 0 ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{result.modelName}</TableCell>
                      <TableCell>{result.testCaseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreBadgeVariant(result.scores.overall)}>
                          {result.scores.overall === 0 && result.feedback.some(f => f.startsWith('Error:')) ? '❌' : ''} {result.scores.overall}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.latency}ms</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedResult(
                            expandedResult === result.id ? null : result.id
                          )}
                        >
                          {expandedResult === result.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedResult === result.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {Object.entries(result.scores).filter(([k]) => k !== 'overall').map(([key, score]) => (
                                <div key={key} className="text-center p-2 bg-white rounded border">
                                  <p className="text-xs text-slate-500 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </p>
                                  <p className="text-lg font-bold">{score}</p>
                                </div>
                              ))}
                            </div>
                            
                            {result.feedback.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Feedback:</p>
                                <ul className="text-sm space-y-1">
                                  {result.feedback.map((f, i) => (
                                    <li key={i} className={f.startsWith('Error:') ? 'text-red-600 font-medium' : 'text-slate-600'}>
                                      {f.startsWith('Error:') ? '❌ ' : '• '}{f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Code className="h-4 w-4 mr-2" /> View Generated Code
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Generated Code</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh]">
                                  <pre className="text-sm bg-slate-100 p-4 rounded-lg overflow-x-auto">
                                    <code>{result.generatedCode || 'No code generated'}</code>
                                  </pre>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
