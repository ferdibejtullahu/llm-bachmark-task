import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Code, Layout, Server, FlaskConical, Lightbulb } from 'lucide-react';
import type { TestCase } from '@/types/benchmark';
import { saveCustomTestCase } from '@/data/testCases';

interface CreateTestCaseDialogProps {
  onTestCaseCreated: () => void;
}

const PROMPT_HINTS: Record<string, { title: string; example: string }> = {
  frontend: {
    title: 'Frontend Development Hint',
    example: `Create a React component that:
1. Accepts user input via props
2. Manages internal state with useState
3. Handles user interactions (onClick, onChange)
4. Renders conditional UI based on state
5. Uses TypeScript interfaces for props

Include proper error handling and loading states.`
  },
  backend: {
    title: 'Backend Development Hint',
    example: `Create an Express.js API endpoint that:
1. Handles HTTP requests (GET/POST/PUT/DELETE)
2. Validates input parameters
3. Performs database operations
4. Returns proper HTTP status codes
5. Includes error handling middleware

Use TypeScript with proper type definitions.`
  },
  testing: {
    title: 'Test Generation Hint',
    example: `Write Jest tests that:
1. Test the main functionality
2. Include edge cases (null, empty, invalid)
3. Mock external dependencies
4. Verify error handling
5. Check async behavior

Use describe/it blocks with clear test names.`
  }
};

export function CreateTestCaseDialog({ onTestCaseCreated }: CreateTestCaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'frontend' | 'backend' | 'testing'>('frontend');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const hint = useMemo(() => PROMPT_HINTS[category], [category]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'frontend': return <Layout className="h-4 w-4" />;
      case 'backend': return <Server className="h-4 w-4" />;
      case 'testing': return <FlaskConical className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim() || !prompt.trim()) return;

    const newTestCase: TestCase = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || name.trim(),
      difficulty,
      tags: tags.length > 0 ? tags : [category],
      prompt: prompt.trim(),
      evaluationCriteria: [
        {
          name: 'Functionality',
          description: 'Code completeness and correctness',
          weight: 0.25,
          check: (code: string) => ({
            score: code.length > 100 ? 8 : 5,
            maxScore: 10,
            feedback: 'Basic functionality check based on code length'
          })
        },
        {
          name: 'Code Quality',
          description: 'Code structure and best practices',
          weight: 0.2,
          check: (code: string) => ({
            score: code.includes('interface') || code.includes('type') ? 8 : 5,
            maxScore: 10,
            feedback: 'TypeScript usage check'
          })
        },
        {
          name: 'Security',
          description: 'Security best practices',
          weight: 0.2,
          check: (code: string) => ({
            score: !code.includes('eval(') && !code.includes('innerHTML') ? 8 : 4,
            maxScore: 10,
            feedback: 'Security patterns check'
          })
        },
        {
          name: 'Performance',
          description: 'Optimization techniques',
          weight: 0.15,
          check: (code: string) => ({
            score: code.includes('useMemo') || code.includes('useCallback') || code.includes('cache') ? 7 : 5,
            maxScore: 10,
            feedback: 'Optimization patterns check'
          })
        },
        {
          name: 'Accessibility',
          description: 'ARIA and accessibility',
          weight: 0.1,
          check: (code: string) => ({
            score: code.includes('aria-') || code.includes('alt=') ? 7 : 4,
            maxScore: 10,
            feedback: 'Accessibility attributes check'
          })
        },
        {
          name: 'Error Handling',
          description: 'Error handling and edge cases',
          weight: 0.1,
          check: (code: string) => ({
            score: code.includes('try') && code.includes('catch') ? 8 : 4,
            maxScore: 10,
            feedback: 'Error handling check'
          })
        }
      ]
    };

    saveCustomTestCase(newTestCase);
    onTestCaseCreated();
    
    // Reset form
    setName('');
    setDescription('');
    setPrompt('');
    setTags([]);
    setDifficulty('medium');
    setCategory('frontend');
    setOpen(false);
  };

  const isValid = name.trim() && prompt.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> Create Test Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon(category)}
            Create New Test Case
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Category Selection */}
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4" /> Frontend Development
                  </div>
                </SelectItem>
                <SelectItem value="backend">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" /> Backend Development
                  </div>
                </SelectItem>
                <SelectItem value="testing">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" /> Test Generation
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <Label>Test Case Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React Login Form Component"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this test evaluates"
            />
          </div>

          {/* Difficulty */}
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., react, api)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <Label>Prompt for LLM</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={hint.example}
              className="min-h-[200px] font-mono text-sm"
            />
            {/* Dynamic Hint Box */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{hint.title}</p>
                  <p className="text-sm text-amber-700 mt-1 whitespace-pre-line">{hint.example}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              Create Test Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
