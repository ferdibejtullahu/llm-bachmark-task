import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ModelConfig } from '@/types/benchmark';
import { Cpu, Settings, RotateCcw } from 'lucide-react';

interface ModelConfigurationProps {
  models: ModelConfig[];
  onToggleModel: (modelId: string) => void;
  onUpdateModel: (modelId: string, updates: Partial<ModelConfig>) => void;
  onResetModels?: () => void;
}

export function ModelConfiguration({
  models,
  onToggleModel,
  onUpdateModel,
  onResetModels
}: ModelConfigurationProps) {
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [globalOpenRouterKey, setGlobalOpenRouterKey] = useState<string>('');

  // Apply global API key to all OpenRouter models when it changes
  const handleGlobalApiKeyChange = (key: string) => {
    setGlobalOpenRouterKey(key);
    openRouterModels.forEach(model => {
      onUpdateModel(model.id, { apiKey: key });
    });
  };

  const ollamaModels = models.filter(m => m.provider === 'ollama');
  const openRouterModels = models.filter(m => m.provider === 'openrouter');

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'ollama': return 'bg-blue-100 text-blue-700';
      case 'openrouter': return 'bg-purple-100 text-purple-700';
      case 'openai': return 'bg-green-100 text-green-700';
      case 'custom': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const ModelCard = ({ model }: { model: ModelConfig }) => (
    <div className={`p-4 rounded-lg border ${model.enabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900">{model.name}</span>
            <Badge variant="secondary" className={`text-xs ${getProviderBadgeColor(model.provider)}`}>
              {model.provider}
            </Badge>
            {model.enabled && (
              <Badge className="text-xs bg-green-100 text-green-700">
                Enabled
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">{model.modelId}</p>
          
          {editingModel === model.id ? (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-500">Temperature</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={model.temperature}
                    onChange={(e) => onUpdateModel(model.id, { temperature: parseFloat(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Max Tokens</Label>
                  <Input
                    type="number"
                    min="100"
                    max="8000"
                    step="100"
                    value={model.maxTokens}
                    onChange={(e) => onUpdateModel(model.id, { maxTokens: parseInt(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setEditingModel(null)}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>Temp: {model.temperature}</span>
              <span>•</span>
              <span>Max: {model.maxTokens} tokens</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={model.enabled}
            onCheckedChange={() => onToggleModel(model.id)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditingModel(editingModel === model.id ? null : model.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg">Model Configuration</CardTitle>
          </div>
          {onResetModels && (
            <Button variant="outline" size="sm" onClick={onResetModels}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset to Defaults
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="openrouter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openrouter">
              OpenRouter ({openRouterModels.filter(m => m.enabled).length}/{openRouterModels.length})
            </TabsTrigger>
            <TabsTrigger value="ollama">
              Ollama ({ollamaModels.filter(m => m.enabled).length}/{ollamaModels.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="openrouter" className="space-y-3 mt-4">
            <div className="text-sm text-slate-500 mb-3">
              Cloud models via OpenRouter. Enter your API key below to use all models.
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">OpenRouter API Key</Label>
              <Input
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={globalOpenRouterKey}
                onChange={(e) => handleGlobalApiKeyChange(e.target.value)}
                className="bg-white"
              />
              <p className="text-xs text-slate-500 mt-2">
                This key will be applied to all OpenRouter models. Get your key from{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  openrouter.ai/keys
                </a>
              </p>
            </div>
            <div className="grid gap-3">
              {openRouterModels.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ollama" className="space-y-3 mt-4">
            <div className="text-sm text-slate-500 mb-3">
              Local models via Ollama. Make sure Ollama is running on your machine.
            </div>
            <div className="grid gap-3">
              {ollamaModels.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
        