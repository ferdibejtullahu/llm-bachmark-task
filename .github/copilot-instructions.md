# LLM Code Generation Benchmark - AI Coding Agent Instructions

## Project Overview
This is a React/TypeScript application for benchmarking open-source LLMs on code generation tasks. It supports local models (via Ollama) and cloud models (via OpenRouter). The app runs test cases across three categories (frontend, backend, testing), evaluates generated code using pattern-based analysis, and visualizes performance metrics. Features a simplified UI with global OpenRouter API key configuration and streamlined benchmark controls (Start/Stop only).

## Architecture & Data Flow

### Core Service Layer Pattern
The application follows a service-based architecture with clear separation:

- **`services/benchmarkRunner.ts`**: Orchestrates test execution. Uses callbacks for progress/status updates. Key pattern: creates AbortController for cancellation, runs tests sequentially with delay between requests (default 1000ms), persists results to localStorage.
  
- **`services/llmProviders.ts`**: Provider pattern with unified `LLMProvider` interface. Each provider (Ollama, OpenRouter, OpenAI) implements `generateCode()` and `checkAvailability()`. Uses `extractCodeFromMarkdown()` helper to parse code blocks from model responses. Provider selection via `getProvider(config.provider)`.

- **`services/evaluationEngine.ts`**: Pure function evaluation using regex-based pattern matching. The `PATTERNS` object contains all code quality checks. Scoring is weighted: Functionality (25%), Code Quality (20%), Security (20%), Performance (15%), Accessibility (10%), Error Handling (10%).

### State Management
Uses the custom `useBenchmark` hook (not Redux or Context) as the single source of truth:
- Persists to localStorage: `benchmark_models_config`, `benchmark_selected_tests`, `benchmark_results`
- Uses refs (`resultsRef`) to avoid stale closure issues in callbacks
- All state updates go through the hook's exposed functions

### Test Case Structure
Test cases in `data/testCases.ts` follow this pattern:
```typescript
{
  id: string,           // e.g., 'fe-1', 'be-2', 'test-3'
  category: 'frontend' | 'backend' | 'testing',
  prompt: string,       // Sent to LLM
  evaluationCriteria: EvaluationCriterion[]  // Custom checks per test
}
```

## Key Conventions

### Import Aliases
Always use `@/` alias for src imports (configured in vite.config.ts):
```typescript
import { useBenchmark } from '@/hooks/useBenchmark';
import type { ModelConfig } from '@/types/benchmark';
```

### Component Organization
- **Sections** (`sections/`): Feature-level components that handle business logic (ModelConfiguration, TestCaseSelection, ResultsVisualization)
- **UI Components** (`components/ui/`): shadcn/ui primitives - never modify these directly
- Sections receive all data/handlers as props (no direct state access)

### Type Safety
- All benchmark-related types in `types/benchmark.ts`
- Use `type` for object shapes, `interface` when extension is expected
- Provider types: `'ollama' | 'openrouter'`
- Status types: `'idle' | 'running' | 'completed' | 'failed'`

### Provider Configuration Pattern
Models use this config shape:
```typescript
{
  id: string,
  provider: 'ollama' | 'openrouter',
  modelId: string,      // e.g., 'codellama:7b', 'mistralai/codestral-2508'
  apiEndpoint?: string, // Defaults: Ollama 'http://localhost:11434'
  apiKey?: string,      // For OpenRouter: set via global field in UI
  temperature?: number, // Default 0.2
  maxTokens?: number,   // Default 2048-4096
  enabled: boolean
}
```

**Note**: OpenRouter models share a single API key entered in the UI's global field. The key is automatically applied to all OpenRouter models when changed.

### Error Handling & User Feedback
- Use `sonner` toast for all user-facing notifications
- Toast notifications are dismissed when benchmark is stopped
- Service errors throw with descriptive messages; UI catches and displays via toast
- BenchmarkRunner creates zero-score results for failed tests when `continueOnError: true`
- Benchmark controls: Start and Stop only (no Pause/Resume)

## Development Workflows

### Adding a New LLM Provider
1. Create provider class implementing `LLMProvider` interface in `llmProviders.ts`
2. Add to `getProvider()` switch statement
3. Update provider union type in `benchmark.ts`
4. Add default models to `defaultModels` array

### Adding New Test Cases
1. Add test to appropriate section in `data/testCases.ts`
2. Use sequential ID (`fe-N`, `be-N`, `test-N`)
3. Define custom `evaluationCriteria` with `weight` and `check` function
4. Return `ScoreResult` from check: `{ score, maxScore, feedback }`

### Extending Evaluation Criteria
Add patterns to `PATTERNS` object in `evaluationEngine.ts`:
```typescript
hasNewPattern: (code: string) => /regex/.test(code)
```
Then use in category-specific evaluation functions (e.g., `evaluateSecurity`)

### Working with Results
Results persist to localStorage automatically. Access via:
- `BenchmarkRunner.getAllResults()`: Get all persisted results
- `BenchmarkRunner.getResultsByModel(modelId)`: Filter by model

## Critical Dependencies

### UI Library: shadcn/ui + Radix
- Components in `components/ui/` are code-generated via CLI
- To add component: `npx shadcn@latest add <component-name>`
- Never manually edit ui components - regenerate instead
- Use composition: wrap ui components in sections

### Chart Library: Recharts
Used in ResultsVisualization. Pattern:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <XAxis dataKey="name" />
    <Bar dataKey="score" fill="currentColor" />
  </BarChart>
</ResponsiveContainer>
```

### Form Patterns
Uses react-hook-form + zod (available but not heavily used yet). Most forms use controlled components with local state.

## Build & Development

```bash
npm run dev      # Vite dev server (default: http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Ollama Local Setup (for development)
```bash
ollama serve                    # Start Ollama server
ollama pull codellama:7b        # Pull specific models
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:7b
# App connects to http://localhost:11434 by default
```

### Environment Variables
Optional `.env`:
```
VITE_OPENROUTER_API_KEY=sk-...  # Fallback if not set in UI
```

### Current OpenRouter Models
All models optimized for fast code generation:
- `mistralai/codestral-2508` - Specialized for coding, low-latency
- `qwen/qwen3-coder-flash` - Fast Qwen coding model
- `mistralai/mistral-nemo` - 12B efficient model
- `mistralai/ministral-3b` - Lightweight 3B model, very fast

## Common Gotchas

1. **Provider availability checks timeout after 5-10s** - UI shows "unavailable" if Ollama server isn't running
2. **Code extraction from markdown** - Providers return markdown; always extract via `extractCodeFromMarkdown()`
3. **Sequential execution** - Tests run one at a time with delays to avoid rate limits
4. **localStorage size limits** - Results can grow large; consider periodic cleanup
5. **Regex evaluation limitations** - Pattern matching doesn't execute code; false positives possible
6. **AbortController for cancellation** - Benchmark must create new controller for each run
7. **Removed features**: Pause/Resume, Export/Import, Clear Results, Custom models tab, Check Availability button
8. **OpenRouter API key** - Single global entry applies to all OpenRouter models automatically

## Code Style Preferences

- Functional components with hooks (no class components)
- Prefer `const` arrow functions for event handlers
- Use optional chaining: `data?.property`
- Destructure props in function signature
- Group related state with single `useState` when appropriate
- Keep components under ~300 lines; extract sub-components if larger
