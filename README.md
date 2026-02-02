# LLM Code Generation Benchmark

A comprehensive benchmark system for evaluating open-source Large Language Models (LLMs) on source code generation capabilities. This tool systematically evaluates and compares which open-source LLMs perform best for Frontend Development, Backend Development, and Test Case Generation.

## Features

### Supported Models
- **Local Models (via Ollama)**: CodeLlama 7B, DeepSeek Coder 6.7B, Qwen 2.5 Coder 7B
- **Cloud Models (via OpenRouter)**: Codestral 2508, Qwen3 Coder Flash, Mistral Nemo 12B, Ministral 3B

### Test Categories
- **Frontend Development** (5 tests): React components, forms, tables, hooks, modals
- **Backend Development** (5 tests): REST APIs, JWT auth, database operations, caching, WebSockets
- **Test Generation** (5 tests): Unit tests, component tests, integration tests, E2E tests, mock data

### Evaluation Criteria
- **Functionality (25%)**: Code completeness and correctness
- **Code Quality (20%)**: Structure, readability, best practices
- **Security (20%)**: Input validation, safe patterns
- **Performance (15%)**: Optimization techniques
- **Accessibility (10%)**: ARIA labels, keyboard navigation
- **Error Handling (10%)**: Try-catch, validation, edge cases

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **State**: React hooks with localStorage persistence
- **Notifications**: Sonner toast notifications

## Getting Started

### Prerequisites

1. **Node.js 20+** and npm
2. **Ollama** (for local model evaluation) - [Install Ollama](https://ollama.com/)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd llm-code-gen-benchmark

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running the Benchmark

1. **Configure Models**:
   - Go to the "Configure" tab
   - For OpenRouter: Enter your API key once (applies to all OpenRouter models)
   - For Ollama: Ensure Ollama is running (`ollama serve`)
   - Enable the models you want to test

2. **Select Test Cases**:
   - Choose which tests to run (Frontend, Backend, Testing)
   - Select all or specific categories

3. **Run Benchmark**:
   - Click "Start Benchmark"
   - Monitor progress in real-time
   - View results in the "Results" tab

4. **Analyze Results**:
   - View overall scores and breakdowns
   - Compare models with charts and radar graphs
   - Export results for further analysis

## Usage with Local Models (Ollama)

1. Install Ollama from [ollama.com](https://ollama.com)

2. Pull the models you want to test:
```bash
ollama pull codellama:7b
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:7b
```

3. Start Ollama server:
```bash
ollama serve
```

4. In the benchmark UI, enable the Ollama models you want to test

## Usage with OpenRouter

1. Get an API key from [openrouter.ai/keys](https://openrouter.ai/keys)

2. In the Configure tab, go to the OpenRouter tab (first tab)

3. Enter your API key once in the global field - it will apply to all OpenRouter models

4. Enable the lightweight models you want to test (optimized for fast benchmarking)

## Project Structure

```
src/
├── components/ui/          # shadcn/ui components
├── data/
│   └── testCases.ts        # 15 benchmark test cases
├── hooks/
│   └── useBenchmark.ts     # Main state management hook
├── sections/
│   ├── DashboardHeader.tsx
│   ├── ModelConfiguration.tsx
│   ├── TestCaseSelection.tsx
│   ├── ProgressIndicator.tsx
│   └── ResultsVisualization.tsx
├── services/
│   ├── llmProviders.ts     # LLM API integrations
│   ├── evaluationEngine.ts # Code evaluation logic
│   └── benchmarkRunner.ts  # Benchmark orchestration
├── types/
│   └── benchmark.ts        # TypeScript interfaces
└── App.tsx                 # Main application
```

## Customization

### Adding New Test Cases

Edit `src/data/testCases.ts` to add new test cases:

```typescript
{
  id: 'your-test-id',
  name: 'Test Name',
  category: 'frontend', // or 'backend', 'testing'
  description: 'What this test evaluates',
  difficulty: 'medium',
  tags: ['react', 'typescript'],
  prompt: 'Detailed prompt for the LLM...',
  evaluationCriteria: [
    {
      name: 'Criterion Name',
      description: 'What to check',
      weight: 0.3,
      check: (code: string) => ({ score, maxScore, feedback })
    }
  ]
}
```

### Adding Custom Model Providers

Edit `src/services/llmProviders.ts` to add new providers:

```typescript
class MyProvider implements LLMProvider {
  async generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse> {
    // Implementation
  }
  
  async checkAvailability(config: ModelConfig): Promise<boolean> {
    // Implementation
  }
}
```

## Deployment

Build for production:

```bash
npm run build
```

The `dist/` folder contains the static files ready for deployment.

## License

MIT License - feel free to use and modify for your own benchmarking needs.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests for:
- New test cases
- Additional model providers
- UI/UX improvements
- Bug fixes
