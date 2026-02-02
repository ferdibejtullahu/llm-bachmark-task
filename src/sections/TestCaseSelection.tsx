import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteCustomTestCase, getAllTestCases } from '@/data/testCases';
import { CreateTestCaseDialog } from './CreateTestCaseDialog';
import { ClipboardList, Layout, Server, FlaskConical, Trash2 } from 'lucide-react';
import type { TestCase } from '@/types/benchmark';

interface TestCaseSelectionProps {
  selectedTestCases: string[];
  onToggleTestCase: (testCaseId: string) => void;
  onTestCasesChange?: (testCases: TestCase[]) => void;
}

export function TestCaseSelection({
  selectedTestCases,
  onToggleTestCase,
  onTestCasesChange
}: TestCaseSelectionProps) {
  const [allTestCases, setAllTestCases] = useState<TestCase[]>(getAllTestCases());
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh test cases when dialog closes
  const handleTestCaseCreated = () => {
    const updated = getAllTestCases();
    setAllTestCases(updated);
    setRefreshKey(prev => prev + 1);
    onTestCasesChange?.(updated);
  };

  // Load custom test cases on mount
  useEffect(() => {
    const updated = getAllTestCases();
    setAllTestCases(updated);
  }, [refreshKey]);

  const handleDeleteCustomTest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom test case?')) {
      deleteCustomTestCase(id);
      handleTestCaseCreated();
    }
  };

  const frontendTests = allTestCases.filter(t => t.category === 'frontend');
  const backendTests = allTestCases.filter(t => t.category === 'backend');
  const testingTests = allTestCases.filter(t => t.category === 'testing');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const TestCaseCard = ({ test }: { test: TestCase }) => {
    const isSelected = selectedTestCases.includes(test.id);
    const isCustom = test.id.startsWith('custom-');
    
    return (
      <div 
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
          isSelected 
            ? 'border-indigo-200 bg-indigo-50/50' 
            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
        }`}
        onClick={() => onToggleTestCase(test.id)}
      >
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleTestCase(test.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900">{test.name}</span>
              <Badge variant="secondary" className={`text-xs ${getDifficultyColor(test.difficulty)}`}>
                {test.difficulty}
              </Badge>
              {isCustom && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  Custom
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {test.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {test.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {isCustom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => handleDeleteCustomTest(test.id, e)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const CategoryTabContent = ({ 
    tests, 
    category,
    icon: Icon 
  }: { 
    tests: TestCase[];
    category: string;
    icon: React.ElementType;
  }) => {
    const selectedCount = tests.filter(t => selectedTestCases.includes(t.id)).length;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-600" />
          <span className="font-medium text-slate-900">
            {category} Tests
          </span>
          <Badge variant="secondary">
            {selectedCount}/{tests.length} selected
          </Badge>
        </div>
        <div className="grid gap-3">
          {tests.map(test => (
            <TestCaseCard key={test.id} test={test} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg">Test Cases</CardTitle>
          </div>
          <CreateTestCaseDialog onTestCaseCreated={handleTestCaseCreated} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="frontend">
              <Layout className="h-4 w-4 mr-2" /> Frontend
            </TabsTrigger>
            <TabsTrigger value="backend">
              <Server className="h-4 w-4 mr-2" /> Backend
            </TabsTrigger>
            <TabsTrigger value="testing">
              <FlaskConical className="h-4 w-4 mr-2" /> Testing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="frontend" className="mt-4">
            <CategoryTabContent 
              tests={frontendTests} 
              category="Frontend"
              icon={Layout}
            />
          </TabsContent>
          
          <TabsContent value="backend" className="mt-4">
            <CategoryTabContent 
              tests={backendTests} 
              category="Backend"
              icon={Server}
            />
          </TabsContent>
          
          <TabsContent value="testing" className="mt-4">
            <CategoryTabContent 
              tests={testingTests} 
              category="Testing"
              icon={FlaskConical}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
