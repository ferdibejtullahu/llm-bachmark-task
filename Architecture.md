# LLM Code Generation Benchmark - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Process Flows](#process-flows)
7. [Evaluation Engine](#evaluation-engine)
   - [Evaluation Process Overview](#evaluation-process-overview)
   - [Detailed Evaluation Flow](#detailed-evaluation-flow)
   - [Evaluation Dimensions](#evaluation-dimensions)
   - [Pattern Matching System](#pattern-matching-system)
   - [Scoring Algorithm](#scoring-algorithm)
   - [Category-Specific Evaluation](#category-specific-evaluation)
8. [Storage Strategy](#storage-strategy)

---

## System Overview

The LLM Code Generation Benchmark is a React-based web application that evaluates open-source Large Language Models (LLMs) on their code generation capabilities across three domains: Frontend Development, Backend Development, and Test Generation.

### Core Features
- Multi-provider LLM support (Ollama, OpenRouter) with global OpenRouter API key
- 15+ built-in test cases + custom test case creation
- Automated benchmark execution with progress tracking
- Comprehensive evaluation scoring across 6 dimensions
- Interactive results visualization (charts, tables, radar graphs)
- Simplified UI with streamlined Start/Stop controls

### Supported Models

**Ollama (Local)**
- CodeLlama 7B - Code-specialized Llama model
- DeepSeek Coder 6.7B - Efficient coding model
- Qwen2.5 Coder 7B - Latest Qwen coding model

**OpenRouter (Cloud)**
- Mistral Codestral 2508 - Specialized for coding, low-latency
- Qwen3 Coder Flash - Fast lightweight Qwen coding model
- Mistral Nemo 12B - Efficient 12B parameter model
- Ministral 3B - Ultra-lightweight 3B model for fast responses

All OpenRouter models share a single API key configured in the UI.

---

## Architecture Diagrams

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Header     │  │  Dashboard   │  │   Progress   │  │   Results    │   │
│  │   (Stats)    │  │   (Controls) │  │   Indicator  │  │Visualization│   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         MAIN TABS                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Configure  │  │   Results   │  │    About    │                 │   │
│  │  │  (Models +  │  │  (Charts +  │  │  (Info)     │                 │   │
│  │  │  TestCases) │  │  Tables)    │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT LAYER                               │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   useBenchmark  │    │  Model Config   │    │  Test Selection │         │
│  │     Hook        │◄──►│    State        │    │     State       │         │
│  │                 │    │                 │    │                 │         │
│  │  - Models       │    │  - Enabled      │    │  - Selected IDs │         │
│  │  - Test Cases   │    │  - Settings     │    │  - Custom tests │         │
│  │  - Results      │    │  - API Keys     │    │                 │         │
│  │  - Status       │    │                 │    │                 │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    localStorage Persistence                      │       │
│  │  - benchmark_models_config  │  benchmark_selected_tests         │       │
│  │  - benchmark_results_*      │  benchmark_custom_test_cases      │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BENCHMARK ENGINE LAYER                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      BenchmarkRunner (Singleton)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Run       │  │   Execute   │  │  Evaluate   │  │   Store    │ │   │
│  │  │   Setup     │─►│   Tests     │─►│   Results   │─►│   Results  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                                                                      │   │
│  │  - Progress callbacks    - Sequential execution    - localStorage   │   │
│  │  - Status management     - Error handling         - Result batching │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LLM PROVIDER LAYER                                   │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                  │
│  │  OllamaProvider │  │OpenRouterProvider│                                  │
│  │  (Local Models) │  │  (Cloud Models)  │                                  │
│  │                 │  │                  │                                  │
│  │  - codellama-7b │  │  - codestral-2508│                                  │
│  │  - deepseek-6.7b│  │  - qwen3-coder   │                                  │
│  │  - qwen2.5-7b   │  │  - mistral-nemo  │                                  │
│  │                 │  │  - ministral-3b  │                                  │
│  │                 │  │  (Global API key)│                                  │
│  └─────────────────┘  └─────────────────┘                                  │
│                                                                              │
│  Common Interface: generateCode(prompt, config) → { code, latency, tokens } │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EVALUATION ENGINE LAYER                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    evaluateCode(code, testCase)                      │   │
│  │                                                                      │   │
│  │   Input: Generated code + Test case metadata                        │   │
│  │   Output: Scores (0-100) for each dimension                         │   │
│  │                                                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │Functionality│ │ Code Quality│ │   Security  │ │ Performance │   │   │
│  │  │   (25%)     │ │   (20%)     │ │   (20%)     │ │   (15%)     │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐                                      │   │
│  │  │Accessibility│ │Error Handling│                                     │   │
│  │  │   (10%)     │ │   (10%)     │                                      │   │
│  │  └─────────────┘ └─────────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App (Root)
├── Header
│   └── Stats Badges (Models, Tests, Results)
│
├── DashboardHeader
│   ├── Title & Description
│   ├── Stats Summary
│   └── Control Buttons (Start, Stop)
│
├── ProgressIndicator (Conditional - shown when running)
│   ├── Progress Bar
│   ├── Current Model/Test Display
│   └── Status Messages
│
├── Tabs (Configure / Results / About)
│   │
│   ├── Configure Tab
│   │   ├── ModelConfiguration
│   │   │   ├── Provider Tabs (OpenRouter/Ollama)
│   │   │   ├── Global OpenRouter API Key Field
│   │   │   ├── Model Cards (with enable/disable, settings)
│   │   │   └── Reset to Defaults Button
│   │   │
│   │   └── TestCaseSelection
│   │       ├── Category Tabs (Frontend/Backend/Testing)
│   │       ├── CreateTestCaseDialog
│   │       └── Test Case Cards (with selection)
│   │
│   ├── Results Tab
│   │   └── ResultsVisualization
│   │       ├── Summary Stats Cards
│   │       ├── View Toggle (Charts/Table)
│   │       ├── Charts (Bar, Stacked, Radar)
│   │       └── Results Table (with expandable rows)
│   │
│   └── About Tab
│       └── Information Cards
│
└── Footer
```

### Key Components Detail

#### 1. useBenchmark Hook (State Management)
```typescript
// Central state management for the entire application
interface UseBenchmarkReturn {
  // State
  models: ModelConfig[];              // All configured LLMs
  selectedTestCases: string[];        // IDs of selected tests
  status: BenchmarkStatus;            // idle | running | completed | failed
  progress: BenchmarkProgress | null; // Current execution progress
  results: BenchmarkResult[];         // All benchmark results
  
  // Actions
  toggleModel(modelId: string): void;
  toggleTestCase(testCaseId: string): void;
  startBenchmark(): Promise<void>;
  stopBenchmark(): void;
  resetModels(): void;
}
```

#### 2. BenchmarkRunner (Orchestration Engine)
```typescript
class BenchmarkRunner {
  // Singleton pattern for global access
  private currentRun: BenchmarkRun | null;
  private abortController: AbortController | null;
  
  // Core methods
  async runBenchmark(models, testCases, options): Promise<BenchmarkRun>
  stopBenchmark(): void
  saveResult(result: BenchmarkResult): void
  getAllResults(): BenchmarkResult[]
  
  // Callbacks for UI updates
  setProgressCallback(callback): void
  setResultCallback(callback): void
  setStatusCallback(callback): void
}
```

#### 3. LLM Providers (Adapter Pattern)
```typescript
interface LLMProvider {
  generateCode(prompt: string, config: ModelConfig): Promise<LLMResponse>
  checkAvailability(config: ModelConfig): Promise<boolean>
}

// Implementations:
// - OllamaProvider    → Local HTTP API (localhost:11434)
// - OpenRouterProvider → Cloud API (openrouter.ai) with global API key
```

---

## Data Flow

### 1. Benchmark Execution Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────────┐
│  User   │────►│ Click Start │────►│ startBenchmark()│
│ Action  │     │   Button    │     │    (hook)       │
└─────────┘     └─────────────┘     └─────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │   BenchmarkRunner.runBenchmark │
                              │                              │
                              │  1. Filter enabled models     │
                              │  2. Filter selected tests     │
                              │  3. Calculate total runs      │
                              │  4. Initialize progress       │
                              └──────────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
           ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
           │   Model 1   │          │   Model 2   │          │   Model N   │
           │             │          │             │          │             │
           │ Test 1,2,3..│          │ Test 1,2,3..│          │ Test 1,2,3..│
           └─────────────┘          └─────────────┘          └─────────────┘
                    │                        │                        │
                    └────────────────────────┼────────────────────────┘
                                             ▼
                              ┌──────────────────────────────┐
                              │      For Each Test Case       │
                              │                              │
                              │  ┌────────────────────────┐  │
                              │  │ 1. Call LLM Provider   │  │
                              │  │    - POST /api/generate│  │
                              │  │    - Wait for response │  │
                              │  │    - Measure latency   │  │
                              │  └────────────────────────┘  │
                              │              │               │
                              │              ▼               │
                              │  ┌────────────────────────┐  │
                              │  │ 2. Extract Code        │  │
                              │  │    - Parse markdown    │  │
                              │  │    - Remove code blocks│  │
                              │  └────────────────────────┘  │
                              │              │               │
                              │              ▼               │
                              │  ┌────────────────────────┐  │
                              │  │ 3. Evaluate Code       │  │
                              │  │    - Functionality     │  │
                              │  │    - Code Quality      │  │
                              │  │    - Security          │  │
                              │  │    - Performance       │  │
                              │  │    - Accessibility     │  │
                              │  │    - Error Handling    │  │
                              │  └────────────────────────┘  │
                              │              │               │
                              │              ▼               │
                              │  ┌────────────────────────┐  │
                              │  │ 4. Store Result        │  │
                              │  │    - localStorage      │  │
                              │  │    - Update UI         │  │
                              │  └────────────────────────┘  │
                              │              │               │
                              │              ▼               │
                              │  ┌────────────────────────┐  │
                              │  │ 5. Update Progress     │  │
                              │  │    - current++         │  │
                              │  │    - percentComplete   │  │
                              │  └────────────────────────┘  │
                              └──────────────────────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              ▼                              ▼
                    ┌─────────────────┐            ┌─────────────────┐
                    │  Delay (500ms)  │───────────►│   Next Test     │
                    │  (rate limiting)│            │   (if any)      │
                    └─────────────────┘            └─────────────────┘
```

### 2. Test Case Creation Flow

```
┌─────────┐     ┌─────────────────────────┐
│  User   │────►│ Click "Create Test Case"│
│ Action  │     │        Button           │
└─────────┘     └─────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  CreateTestCaseDialog  │
              │       Opens            │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  User Fills Form       │
              │                        │
              │  - Select Category ────┼──► Updates hint dynamically
              │  - Enter Name          │
              │  - Enter Description   │
              │  - Select Difficulty   │
              │  - Add Tags            │
              │  - Write Prompt        │◄── Shows category-specific hint
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Click "Create"        │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  saveCustomTestCase()  │
              │                        │
              │  1. Create TestCase    │
              │     object with        │
              │     evaluationCriteria │
              │                        │
              │  2. Serialize to JSON  │
              │                        │
              │  3. Store in           │
              │     localStorage       │
              │     (benchmark_custom_ │
              │      test_cases)       │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  onTestCaseCreated()   │
              │  callback triggered    │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  UI Updates            │
              │                        │
              │  - Refresh test list   │
              │  - New test appears    │
              │  - Auto-selected       │
              │  - "Custom" badge shown│
              └────────────────────────┘
```

---

## State Management

### State Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              useBenchmark Hook                   │   │
│  │  (Central state container for entire app)        │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │           Model State                   │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ │    │   │
│  │  │  │ Ollama  │ │OpenRouter│ │  Custom  │ │    │   │
│  │  │  │ Models  │ │ Models  │ │  Models  │ │    │   │
│  │  │  │         │ │         │ │          │ │    │   │
│  │  │  │-enabled │ │-enabled │ │-enabled  │ │    │   │
│  │  │  │-settings│ │-apiKey  │ │-endpoint│ │    │   │
│  │  │  └─────────┘ └─────────┘ └──────────┘ │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │         Test Case State                 │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ │    │   │
│  │  │  │ Built-in│ │  Custom │ │ Selected │ │    │   │
│  │  │  │  Tests  │ │  Tests  │ │   IDs    │ │    │   │
│  │  │  │  (15)   │ │ (user)  │ │ (array)  │ │    │   │
│  │  │  └─────────┘ └─────────┘ └──────────┘ │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │         Benchmark State                 │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ │    │   │
│  │  │  │ Status  │ │ Progress│ │ Results  │ │    │   │
│  │  │  │(enum)   │ │(object) │ │(array)   │ │    │   │
│  │  │  │         │ │         │ │          │ │    │   │
│  │  │  │-idle    │ │-current │ │-model   │ │    │   │
│  │  │  │-running │ │-total   │ │-scores  │ │    │   │
│  │  │  │-completed│ │-percent │ │-latency │ │    │   │
│  │  │  │-failed  │ │         │ │          │ │    │   │
│  │  │  │         │ │         │ │          │ │    │   │
│  │  │  └─────────┘ └─────────┘ └──────────┘ │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Persistence Layer (localStorage)       │   │
│  │                                                  │   │
│  │  Key                          │ Data            │   │
│  │  ─────────────────────────────┼────────────────│   │
│  │  benchmark_models_config      │ ModelConfig[]  │   │
│  │  benchmark_selected_tests     │ string[]       │   │
│  │  benchmark_custom_test_cases  │ TestCase[]     │   │
│  │  benchmark_results_${modelId} │ Result[]       │   │
│  │  benchmark_runs               │ Run[]          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### State Update Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  Component Event │
│  Handler         │
└─────────────────┘
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│  useBenchmark   │────►│  setState()     │
│  Hook Method    │     │  (React)        │
└─────────────────┘     └─────────────────┘
    │                           │
    │                           ▼
    │                  ┌─────────────────┐
    │                  │  State Updated  │
    │                  │  (in memory)    │
    │                  └─────────────────┘
    │                           │
    ▼                           ▼
┌─────────────────┐     ┌─────────────────┐
│  useEffect()    │◄────│  Persist to     │
│  (auto-save)    │     │  localStorage   │
└─────────────────┘     └─────────────────┘
    │
    ▼
┌─────────────────┐
│  UI Re-renders  │
│  with new state │
└─────────────────┘
```

---

## Process Flows

### 1. Application Initialization Flow

```
┌─────────────┐
│  App Load   │
└─────────────┘
      │
      ▼
┌─────────────────────────┐
│  useBenchmark Hook Init │
└─────────────────────────┘
      │
      ├──► Load Models from localStorage
      │    └──► If none, use defaultModels
      │
      ├──► Load Selected Tests from localStorage
      │    └──► If none, select all built-in tests
      │
      ├──► Load Results from localStorage
      │    └──► Aggregate all model results
      │
      └──► Setup Callbacks
           ├──► Progress Callback → Update UI
           ├──► Result Callback → Append result
           └──► Status Callback → Update status
      │
      ▼
┌─────────────────────────┐
│  Render UI with State   │
└─────────────────────────┘
```

### 2. Model Configuration Flow

```
User toggles model / changes settings
              │
              ▼
    ┌─────────────────┐
    │ toggleModel()   │
    │ or              │
    │ updateModel()   │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ Update models   │
    │ state (React)   │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ useEffect()     │
    │ triggers        │
    │ (auto-save)     │
    └─────────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Save to localStorage    │
    │ benchmark_models_config │
    └─────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ UI Re-renders   │
    │ - Badge updates │
    │ - Card styling  │
    │ - Enable/Disable│
    └─────────────────┘
```

### 3. Results Storage Flow

```
┌─────────────────────────┐
│ Benchmark Completes     │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ BenchmarkRunner.        │
│ saveResult()            │
│                         │
│ 1. Format result        │
│ 2. Group by model       │
│ 3. Save to localStorage │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ Results automatically   │
│ appear in Results tab   │
└─────────────────────────┘
```

---

## Evaluation Engine

### Evaluation Process Overview

The evaluation engine performs static code analysis on LLM-generated code across six dimensions. It uses pattern matching, heuristics, and category-specific checks to assign scores. The process is **non-executing** (safe) and runs entirely in the browser.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVALUATION PIPELINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   INPUT                              PROCESSING                    OUTPUT   │
│   ─────                              ─────────                    ───────   │
│                                                                              │
│  ┌─────────────┐              ┌─────────────────────────┐         ┌────────┐│
│  │  Generated  │─────────────►│  1. Code Preprocessing │────────►│ Scores ││
│  │  Code       │              │    - Normalize whitespace│        │ (0-100)││
│  │  (string)   │              │    - Extract code blocks │        │        ││
│  │             │              │    - Remove comments     │        │        ││
│  └─────────────┘              └─────────────────────────┘        └────────┘│
│                                          │                                   │
│                                          ▼                                   │
│                              ┌─────────────────────────┐                     │
│                              │  2. Pattern Analysis    │                     │
│                              │    - Regex matching     │                     │
│                              │    - AST-like parsing   │                     │
│                              │    - Token counting     │                     │
│                              └─────────────────────────┘                     │
│                                          │                                   │
│                                          ▼                                   │
│                              ┌─────────────────────────┐                     │
│                              │  3. Dimension Scoring   │                     │
│                              │    - 6 dimensions       │                     │
│                              │    - Category-specific  │                     │
│                              │    - Weighted average   │                     │
│                              └─────────────────────────┘                     │
│                                          │                                   │
│                                          ▼                                   │
│                              ┌─────────────────────────┐                     │
│                              │  4. Feedback Generation │                     │
│                              │    - Positive findings  │                     │
│                              │    - Improvement tips   │                     │
│                              │    - Critical issues    │                     │
│                              └─────────────────────────┘                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Evaluation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DETAILED EVALUATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Code Preprocessing                                                  │
│  ══════════════════════════                                                  │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │  Raw Response   │───►│ Extract Code    │───►│ Normalize Code  │          │
│  │  from LLM       │    │ from Markdown   │    │ for Analysis    │          │
│  │                 │    │                 │    │                 │          │
│  │ ```typescript   │    │ Remove:         │    │ - Trim whitespace│          │
│  │ const x = 1;    │    │ - ``` blocks    │    │ - Normalize newlines│       │
│  │ ```             │    │ - Language tags │    │ - Remove extra  │          │
│  │                 │    │                 │    │   blank lines   │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│                                                                              │
│  Step 2: Pattern Matching                                                    │
│  ════════════════════════                                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PATTERN REGISTRY                                  │    │
│  │                                                                       │    │
│  │  Category        Pattern                    Matches                   │    │
│  │  ─────────────────────────────────────────────────────────────────    │    │
│  │  TypeScript      /interface\s+\w+/          Interface definitions     │    │
│  │                  /type\s+\w+/                Type aliases             │    │
│  │                  /=\s*\w+\s*:/               Type annotations         │    │
│  │                                                                       │    │
│  │  React           /React|import.*react/i     React usage               │    │
│  │                  /useState|useEffect/       Hooks usage               │    │
│  │                  /createPortal/             Portal usage              │    │
│  │                                                                       │    │
│  │  Backend         /express|router|app\./     Express/Route handlers    │    │
│  │                  /middleware|next\(/        Middleware pattern        │    │
│  │                  /jwt|token|auth/           Authentication            │    │
│  │                                                                       │    │
│  │  Testing         /describe|it\(|test\(/     Test structure            │    │
│  │                  /expect\(/                 Assertions                │    │
│  │                  /mock|spyOn|jest/          Mocking                   │    │
│  │                                                                       │    │
│  │  Security        /\beval\s*\(/              Dangerous eval()          │    │
│  │                  /\.innerHTML\s*=/          XSS vulnerability         │    │
│  │                  /bcrypt|hash|salt/         Password hashing          │    │
│  │                                                                       │    │
│  │  Quality         /\b(const|let)\s+/         Modern JS (no var)       │    │
│  │                  /\basync\b|\bawait\b/      Async/await pattern       │    │
│  │                  /=>\s*\{?/                 Arrow functions           │    │
│  │                                                                       │    │
│  │  Accessibility   /aria-[a-z]+|role=/        ARIA attributes           │    │
│  │                  /alt=/                     Alt text for images       │    │
│  │                  /<label|htmlFor=/          Form labels               │    │
│  │                                                                       │    │
│  │  Error Handling  /try\s*\{[\s\S]*?\}\s*catch/  Try-catch blocks       │    │
│  │                  /throw|Error|error/        Error handling            │    │
│  │                  /default\s*:/              Default cases             │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Step 3: Dimension Evaluation                                                │
│  ═══════════════════════════════                                             │
│                                                                              │
│  For each dimension, the engine runs category-specific checks:               │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluateFunctionality(code, testCase, feedback, details)                 │
│  │ ───────────────────────────────────────────────────────                  │
│  │ Base Score: 0                                                              │
│  │                                                                            │
│  │ +20 pts: Code length > 50 chars (basic presence)                         │
│  │ +15 pts: Has TypeScript types (interface/type)                           │
│  │ +10 pts: Has proper imports                                              │
│  │ +10 pts: Has exports                                                     │
│  │ +15 pts: Has functions/components                                        │
│  │                                                                            │
│  │ Category Bonus:                                                            │
│  │ • Frontend: +15 (React usage), +15 (Hooks usage)                         │
│  │ • Backend:  +15 (Express/Route handlers), +15 (Middleware)               │
│  │ • Testing:  +20 (Test structure), +10 (Mocking)                          │
│  │                                                                            │
│  │ MAX: 100 points                                                            │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluateCodeQuality(code, testCase, feedback, details)                   │
│  │ ─────────────────────────────────────────────────────                    │
│  │ Base Score: 0                                                              │
│  │                                                                            │
│  │ +15 pts: Uses const/let (not var)                                        │
│  │ +10 pts: No var usage                                                    │
│  │ +10 pts: Uses arrow functions                                            │
│  │ +15 pts: Uses async/await                                                │
│  │ +10 pts: Uses destructuring                                              │
│  │ +10 pts: Has comments                                                    │
│  │ +15 pts: Has JSDoc documentation                                         │
│  │ +15 pts: Reasonable code length (10-500 lines)                           │
│  │                                                                            │
│  │ MAX: 100 points                                                            │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluateSecurity(code, testCase, feedback, details)                      │
│  │ ───────────────────────────────────────────────────                      │
│  │ Base Score: 50 (neutral starting point)                                  │
│  │                                                                            │
│  │ +20 pts: Has input validation                                            │
│  │ +15 pts: No eval() usage                                                 │
│  │ +15 pts: No innerHTML assignment                                         │
│  │ +15 pts: Uses parameterized queries                                      │
│  │                                                                            │
│  │ Backend Bonus:                                                             │
│  │ +10 pts: Password hashing (bcrypt)                                       │
│  │ +10 pts: Authentication (jwt/token)                                      │
│  │ +10 pts: Security middleware (helmet/cors)                               │
│  │                                                                            │
│  │ PENALTIES:                                                                 │
│  │ -30 pts: Uses eval() (CRITICAL)                                          │
│  │ -20 pts: Uses innerHTML (XSS risk)                                       │
│  │                                                                            │
│  │ MAX: 100, MIN: 0 points                                                    │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluatePerformance(code, testCase, feedback, details)                   │
│  │ ──────────────────────────────────────────────────────                   │
│  │ Base Score: 50 (neutral starting point)                                  │
│  │                                                                            │
│  │ +20 pts: Uses memoization (useMemo/useCallback/cache)                    │
│  │ +15 pts: Uses efficient array methods (map/filter/reduce)                │
│  │ +15 pts: No deeply nested loops                                          │
│  │                                                                            │
│  │ Frontend Bonus:                                                            │
│  │ +15 pts: React optimization (memo/useMemo/useCallback)                   │
│  │ +10 pts: Code splitting (lazy/Suspense)                                  │
│  │                                                                            │
│  │ Backend Bonus:                                                             │
│  │ +20 pts: Caching implementation (redis/cache)                            │
│  │ +15 pts: Pagination usage                                                │
│  │ +10 pts: Query optimization                                              │
│  │                                                                            │
│  │ MAX: 100 points                                                            │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluateAccessibility(code, testCase, feedback, details)                 │
│  │ ────────────────────────────────────────────────────────                 │
│  │ Base Score: 50 (neutral, only for Frontend)                              │
│  │                                                                            │
│  │ Non-Frontend: Returns 50 (neutral, not applicable)                       │
│  │                                                                            │
│  │ Frontend Checks:                                                           │
│  │ +20 pts: Has ARIA attributes (aria-*, role)                              │
│  │ +15 pts: Has alt text for images                                         │
│  │ +15 pts: Has form labels (<label>, htmlFor)                              │
│  │ +15 pts: Has focus management (tabIndex, focus)                          │
│  │ +15 pts: Has keyboard navigation (onKeyDown, onKeyUp)                    │
│  │                                                                            │
│  │ If no checks pass → feedback: "Add accessibility attributes"             │
│  │                                                                            │
│  │ MAX: 100 points                                                            │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │ evaluateErrorHandling(code, testCase, feedback, details)                 │
│  │ ────────────────────────────────────────────────────────                 │
│  │ Base Score: 30 (minimum expectation)                                     │
│  │                                                                            │
│  │ +25 pts: Has try-catch blocks                                            │
│  │ +20 pts: Has error handling (catch/throw/Error)                          │
│  │ +15 pts: Has input validation (if + return/throw)                        │
│  │ +10 pts: Has default cases (switch default)                              │
│  │                                                                            │
│  │ Backend Bonus:                                                             │
│  │ +15 pts: Error middleware (next(error))                                  │
│  │ +10 pts: Proper response formatting (status/json)                        │
│  │                                                                            │
│  │ Testing Bonus:                                                             │
│  │ +20 pts: Tests error cases (throws/rejects/toThrow)                      │
│  │                                                                            │
│  │ If score < 60 → feedback: "Add error handling"                           │
│  │                                                                            │
│  │ MAX: 100 points                                                            │
│  └─────────────────┘                                                         │
│                                                                              │
│  Step 4: Overall Score Calculation                                           │
│  ═══════════════════════════════════                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    WEIGHTED AVERAGE FORMULA                          │    │
│  │                                                                       │    │
│  │  overall = functionality × 0.25                                      │    │
│  │          + codeQuality   × 0.20                                      │    │
│  │          + security      × 0.20                                      │    │
│  │          + performance   × 0.15                                      │    │
│  │          + accessibility × 0.10                                      │    │
│  │          + errorHandling × 0.10                                      │    │
│  │                                                                       │    │
│  │  Example:                                                             │    │
│  │  ────────                                                             │    │
│  │  Functionality: 85 × 0.25 = 21.25                                    │    │
│  │  Code Quality:  70 × 0.20 = 14.00                                    │    │
│  │  Security:      90 × 0.20 = 18.00                                    │    │
│  │  Performance:   60 × 0.15 =  9.00                                    │    │
│  │  Accessibility: 50 × 0.10 =  5.00                                    │    │
│  │  Error Handling: 75 × 0.10 =  7.50                                   │    │
│  │  ────────────────────────────────                                    │    │
│  │  OVERALL: 74.75 → ROUNDED: 75                                        │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Step 5: Feedback Generation                                                 │
│  ════════════════════════════                                                │
│                                                                              │
│  Based on scores, generate actionable feedback:                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Score < 60 in any dimension → Add improvement suggestion           │    │
│  │                                                                       │    │
│  │  Functionality < 60: "Ensure all required features are implemented" │    │
│  │  Code Quality < 60: "Improve code structure and follow best practices"│   │
│  │  Security < 60: "Address potential security vulnerabilities"        │    │
│  │  Performance < 60: "Consider optimization techniques"               │    │
│  │  Accessibility < 60: "Add ARIA labels and improve keyboard navigation"│  │
│  │  Error Handling < 60: "Add comprehensive error handling"            │    │
│  │                                                                       │    │
│  │  Positive feedback also included for high scores!                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Evaluation Dimensions

| Dimension | Weight | Description | Key Checks |
|-----------|--------|-------------|------------|
| **Functionality** | 25% | Code completeness and correctness | TypeScript usage, proper structure, category-specific patterns |
| **Code Quality** | 20% | Code structure and best practices | Modern JS features, comments, documentation, code length |
| **Security** | 20% | Security best practices | No dangerous patterns, input validation, auth/caching |
| **Performance** | 15% | Optimization techniques | Memoization, efficient loops, pagination, caching |
| **Accessibility** | 10% | ARIA and accessibility (Frontend only) | ARIA attributes, alt text, labels, keyboard navigation |
| **Error Handling** | 10% | Error handling and edge cases | Try-catch, validation, error middleware, error tests |

### Pattern Matching System

```typescript
// ============================================
// PATTERN REGISTRY - Complete Pattern Reference
// ============================================

const PATTERNS = {
  // TypeScript & Type Safety
  hasTypeScript:      (code: string) => /interface\s+\w+|type\s+\w+|:\s*\w+/.test(code),
  hasGenerics:        (code: string) => /<[A-Z]|<T|<[A-Z][a-z]+/.test(code),
  
  // React Patterns
  hasReactImports:    (code: string) => /React|import.*react/i.test(code),
  hasHooks:           (code: string) => /useState|useEffect|useCallback|useMemo/.test(code),
  hasJSX:             (code: string) => /return\s*\(|<[A-Z][a-zA-Z]/.test(code),
  hasPortal:          (code: string) => /createPortal/.test(code),
  
  // Backend Patterns
  hasExpress:         (code: string) => /express|router|app\.(get|post|put|delete)/i.test(code),
  hasMiddleware:      (code: string) => /middleware|next\(/.test(code),
  hasJWT:             (code: string) => /jwt|token|verify|sign/.test(code),
  
  // Database Patterns
  hasPrisma:          (code: string) => /prisma|@relation|model\s+\w+/.test(code),
  hasQueries:         (code: string) => /findMany|findUnique|create|update|delete/.test(code),
  
  // Testing Patterns
  hasTestStructure:   (code: string) => /describe|it\(|test\(|expect\(/.test(code),
  hasMocking:         (code: string) => /mock|spyOn|jest\.fn|vi\.fn/.test(code),
  
  // Security Patterns
  noEval:             (code: string) => !/\beval\s*\(/.test(code),
  noInnerHTML:        (code: string) => !/\.innerHTML\s*=/.test(code),
  hasInputValidation: (code: string) => /validate|sanitiz|escape|encode/i.test(code),
  hasPasswordHashing: (code: string) => /bcrypt|hash|salt/.test(code),
  
  // Code Quality Patterns
  usesConstLet:       (code: string) => /\b(const|let)\s+/.test(code),
  noVar:              (code: string) => !/\bvar\s+/.test(code),
  usesArrowFunctions: (code: string) => /=>\s*\{?/.test(code),
  usesAsyncAwait:     (code: string) => /\basync\b|\bawait\b/.test(code),
  usesDestructuring:  (code: string) => /\{[^}]+\}\s*=|\[[^\]]+\]\s*=/.test(code),
  
  // Performance Patterns
  usesMemoization:    (code: string) => /useMemo|useCallback|memo|cache/.test(code),
  hasPagination:      (code: string) => /pagination|limit|offset|skip/.test(code),
  
  // Accessibility Patterns
  hasARIA:            (code: string) => /aria-[a-z]+|role=/.test(code),
  hasAltText:         (code: string) => /alt=/.test(code),
  hasLabels:          (code: string) => /<label|htmlFor=/.test(code),
  hasFocusManagement: (code: string) => /tabIndex|focus|blur/.test(code),
  
  // Error Handling Patterns
  hasTryCatch:        (code: string) => /try\s*\{[\s\S]*?\}\s*catch/.test(code),
  hasErrorHandling:   (code: string) => /catch|throw|Error|error/.test(code),
  hasValidation:      (code: string) => /if\s*\([^)]*\)\s*\{[^}]*(?:return|throw)/.test(code),
};
```

### Scoring Algorithm

```typescript
// ============================================
// SCORING ALGORITHM - Pseudocode
// ============================================

function evaluateCode(code: string, testCase: TestCase): EvaluationResult {
  const feedback: string[] = [];
  const details: Record<string, any> = {};
  
  // Step 1: Evaluate each dimension
  const functionality = evaluateFunctionality(code, testCase, feedback, details);
  const codeQuality = evaluateCodeQuality(code, testCase, feedback, details);
  const security = evaluateSecurity(code, testCase, feedback, details);
  const performance = evaluatePerformance(code, testCase, feedback, details);
  const accessibility = evaluateAccessibility(code, testCase, feedback, details);
  const errorHandling = evaluateErrorHandling(code, testCase, feedback, details);
  
  // Step 2: Calculate weighted overall score
  const weights = {
    functionality: 0.25,
    codeQuality: 0.20,
    security: 0.20,
    performance: 0.15,
    accessibility: 0.10,
    errorHandling: 0.10
  };
  
  const overall = Math.round(
    functionality * weights.functionality +
    codeQuality * weights.codeQuality +
    security * weights.security +
    performance * weights.performance +
    accessibility * weights.accessibility +
    errorHandling * weights.errorHandling
  );
  
  // Step 3: Generate additional feedback for low scores
  if (functionality < 60) feedback.push('Functionality: Ensure all required features are implemented');
  if (codeQuality < 60) feedback.push('Code Quality: Improve code structure and follow best practices');
  if (security < 60) feedback.push('Security: Address potential security vulnerabilities');
  if (performance < 60) feedback.push('Performance: Consider optimization techniques');
  if (accessibility < 60) feedback.push('Accessibility: Add ARIA labels and improve keyboard navigation');
  if (errorHandling < 60) feedback.push('Error Handling: Add comprehensive error handling');
  
  return {
    scores: { functionality, codeQuality, security, performance, accessibility, errorHandling, overall },
    feedback,
    details
  };
}
```

### Category-Specific Evaluation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CATEGORY-SPECIFIC EVALUATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND DEVELOPMENT                                                        │
│  ════════════════════════                                                    │
│                                                                              │
│  Extra checks for Frontend test cases:                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Functionality Bonus (+30 pts max)                                   │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +15 pts: React usage detected (import React, JSX)                  │    │
│  │  +15 pts: React hooks used (useState, useEffect, etc.)              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Performance Bonus (+25 pts max)                                     │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +15 pts: React optimization (React.memo, useMemo, useCallback)     │    │
│  │  +10 pts: Code splitting (lazy, Suspense, dynamic imports)          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Accessibility (Full 50 pts available)                               │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +20 pts: ARIA attributes (aria-label, aria-describedby, role)      │    │
│  │  +15 pts: Alt text for images                                       │    │
│  │  +15 pts: Form labels (<label> or htmlFor)                          │    │
│  │  +15 pts: Focus management (tabIndex, focus handlers)               │    │
│  │  +15 pts: Keyboard navigation (onKeyDown, onKeyUp)                  │    │
│  │                                                                       │    │
│  │  Note: Non-frontend categories get neutral 50 pts for accessibility │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  BACKEND DEVELOPMENT                                                         │
│  ═══════════════════════                                                     │
│                                                                              │
│  Extra checks for Backend test cases:                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Functionality Bonus (+30 pts max)                                   │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +15 pts: Express/Route handlers present (app.get, router.post)     │    │
│  │  +15 pts: Middleware pattern used (next(), middleware functions)    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Security Bonus (+30 pts max)                                        │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +10 pts: Password hashing (bcrypt, hash, salt)                     │    │
│  │  +10 pts: Authentication (jwt, token, auth middleware)              │    │
│  │  +10 pts: Security middleware (helmet, cors, rate-limit)            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Performance Bonus (+45 pts max)                                     │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +20 pts: Caching implementation (redis, cache, memoize)            │    │
│  │  +15 pts: Pagination used (limit, offset, skip)                     │    │
│  │  +10 pts: Query optimization (index, select, include)               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Error Handling Bonus (+25 pts max)                                  │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +15 pts: Error middleware (next(error), error handler)             │    │
│  │  +10 pts: Proper response formatting (res.status, res.json)         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  TEST GENERATION                                                             │
│  ═════════════════                                                           │
│                                                                              │
│  Extra checks for Testing test cases:                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Functionality Bonus (+30 pts max)                                   │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +20 pts: Test structure present (describe, it, test, expect)       │    │
│  │  +10 pts: Mocking used (mock, spyOn, jest.fn, vi.fn)                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Error Handling Bonus (+20 pts max)                                  │    │
│  │  ─────────────────────────────────                                   │    │
│  │  +20 pts: Error cases tested (throws, rejects, toThrow)             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Evaluation Result Structure

```typescript
interface EvaluationResult {
  scores: {
    functionality: number;   // 0-100
    codeQuality: number;     // 0-100
    security: number;        // 0-100
    performance: number;     // 0-100
    accessibility: number;   // 0-100
    errorHandling: number;   // 0-100
    overall: number;         // 0-100 (weighted average)
  };
  feedback: string[];        // Actionable improvement suggestions
  details: {
    // Per-dimension check results for debugging
    functionalityChecks?: string[];
    codeQualityChecks?: string[];
    securityChecks?: string[];
    performanceChecks?: string[];
    accessibilityChecks?: string[];
    errorHandlingChecks?: string[];
  };
}
```

---

## Storage Strategy

### localStorage Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      localStorage Keys                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ benchmark_models_config  │  │  ModelConfig[]               ││
│  │                          │  │                              ││
│  │ [{                        │  │  - id, name, provider        ││
│  │   id: "llama3",           │  │  - modelId, enabled          ││
│  │   name: "Llama 3 8B",     │  │  - temperature, maxTokens    ││
│  │   provider: "ollama",     │  │  - apiEndpoint, apiKey       ││
│  │   enabled: true,          │  │                              ││
│  │   ...                     │  │                              ││
│  │ }]                        │  │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ benchmark_selected_tests │  │  string[]                    ││
│  │                          │  │                              ││
│  │ ["fe-1", "fe-2",         │  │  Array of selected           ││
│  │  "be-1", "custom-123"]    │  │  test case IDs               ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ benchmark_custom_test_   │  │  TestCase[]                  ││
│  │ cases                    │  │                              ││
│  │                          │  │  User-created test cases     ││
│  │ [{                        │  │  with full metadata          ││
│  │   id: "custom-123",       │  │  (evaluationCriteria are     ││
│  │   name: "My Test",        │  │  restored on load)           ││
│  │   category: "frontend",   │  │                              ││
│  │   ...                     │  │                              ││
│  │ }]                        │  │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ benchmark_results_${id}  │  │  BenchmarkResult[]           ││
│  │                          │  │                              ││
│  │ Example keys:            │  │  Results grouped by model    ││
│  │ - benchmark_results_llama3│  │  for efficient retrieval     ││
│  │ - benchmark_results_mistral│ │                              ││
│  │ - benchmark_results_custom-│ │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ benchmark_runs           │  │  BenchmarkRun[]              ││
│  │                          │  │                              ││
│  │ History of all benchmark │  │  For tracking execution      ││
│  │ runs with metadata       │  │  history                     ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    Data Lifecycle                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CREATE          READ           UPDATE         DELETE   │
│  ─────           ────           ──────         ──────   │
│                                                          │
│  User creates    App loads      User modifies  User     │
│  custom test     on startup:    settings:      clears   │
│  case:           - Models       - Toggle model results: │
│  - Form submit   - Tests        - Edit config  - Delete │
│  - Validate      - Results      - Update test  custom   │
│  - Save to LS    from LS        case           test     │
│                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   ┌────────┐│
│  │ localStorage│  │ localStorage│  │ localStorage│   │ localStorage│
│  │ .setItem() │  │ .getItem() │  │ .setItem() │   │removeItem()│
│  └─────────┘    └─────────┘    └─────────┘   └────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Persistence Strategy                    ││
│  │                                                      ││
│  │  - Auto-save on state change (useEffect)            ││
│  │  - JSON serialization for objects                   ││
│  │  - Error handling for storage quota                 ││
│  │  - Graceful degradation if LS unavailable           ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## API Integration

### Ollama Provider

```
┌─────────────────────────────────────────┐
│           OllamaProvider                │
│         (Local LLM Server)              │
├─────────────────────────────────────────┤
│                                          │
│  Endpoint: http://localhost:11434       │
│                                          │
│  generateCode(prompt, config):          │
│    POST /api/generate                   │
│    Body: {                              │
│      model: "llama3:8b",                │
│      prompt: "...",                     │
│      stream: false,                     │
│      options: {                         │
│        temperature: 0.2,                │
│        num_predict: 2048                │
│      }                                  │
│    }                                    │
│                                          │
│  checkAvailability():                   │
│    GET /api/tags                        │
│    Returns: List of available models    │
│                                          │
└─────────────────────────────────────────┘
```

### OpenRouter Provider

```
┌─────────────────────────────────────────┐
│         OpenRouterProvider              │
│         (Cloud LLM API)                 │
├─────────────────────────────────────────┤
│                                          │
│  Endpoint: https://openrouter.ai        │
│                                          │
│  generateCode(prompt, config):          │
│    POST /api/v1/chat/completions        │
│    Headers: {                           │
│      Authorization: "Bearer {apiKey}",  │
│      HTTP-Referer: window.location      │
│    }                                    │
│    Body: {                              │
│      model: "meta-llama/codellama-70b", │
│      messages: [                        │
│        { role: "system", content: "..."}│
│        { role: "user", content: prompt} │
│      ],                                 │
│      temperature: 0.2,                  │
│      max_tokens: 4096                   │
│    }                                    │
│                                          │
│  checkAvailability():                   │
│    GET /api/v1/models                   │
│    Returns: List of available models    │
│                                          │
└─────────────────────────────────────────┘
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────────┐
│                   Security Measures                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. API Key Storage                                      │
│     - Stored in localStorage (client-side only)         │
│     - Never sent to server (direct LLM provider calls)  │
│     - Input type="password" for masking                 │
│                                                          │
│  2. Code Evaluation                                      │
│     - Static analysis only (no code execution)          │
│     - Pattern matching for security checks              │
│     - No eval() or dynamic code execution               │
│                                                          │
│  3. Data Sanitization                                    │
│     - Input trimming and validation                     │
│     - JSON serialization for storage                    │
│     - Error boundaries for graceful failures            │
│                                                          │
│  4. Rate Limiting                                        │
│     - Built-in delay between requests (500ms)           │
│     - Sequential execution (not parallel)               │
│     - User-configurable delays                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────┐
│              Performance Optimizations                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. React Optimizations                                  │
│     - useCallback for stable function references        │
│     - useMemo for expensive calculations                │
│     - useRef for mutable values without re-render       │
│                                                          │
│  2. Data Processing                                      │
│     - Lazy loading of results (on tab switch)           │
│     - Memoized chart data calculation                   │
│     - Virtual scrolling for large tables                │
│                                                          │
│  3. Network Optimizations                                │
│     - Sequential API calls (rate limiting)              │
│     - Request cancellation with AbortController         │
│     - Cached availability checks                        │
│                                                          │
│  4. Storage Optimizations                                │
│     - Grouped results by model (efficient retrieval)    │
│     - JSON batch operations                             │
│     - Lazy persistence (debounced saves)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Extension Points

```
┌─────────────────────────────────────────────────────────┐
│                   Extension Points                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Adding New LLM Providers                             │
│     - Implement LLMProvider interface                   │
│     - Add to provider factory                           │
│     - Update UI for configuration                       │
│                                                          │
│  2. Adding New Evaluation Criteria                       │
│     - Add to evaluation engine patterns                 │
│     - Update scoring algorithm                          │
│     - Add UI for weight configuration                   │
│                                                          │
│  3. Adding New Test Case Types                           │
│     - Extend TestCase interface if needed               │
│     - Add category to dropdown                          │
│     - Create default evaluation criteria                │
│                                                          │
│  4. Custom Visualization                                 │
│     - Add new chart type to ResultsVisualization        │
│     - Implement data transformer                        │
│     - Add view mode toggle                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
/mnt/okcomputer/output/app/
├── src/
│   ├── components/ui/          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── data/
│   │   └── testCases.ts        # Built-in + custom test cases
│   │
│   ├── hooks/
│   │   └── useBenchmark.ts     # Central state management
│   │
│   ├── sections/               # Page sections
│   │   ├── DashboardHeader.tsx
│   │   ├── ModelConfiguration.tsx
│   │   ├── TestCaseSelection.tsx
│   │   ├── CreateTestCaseDialog.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── ResultsVisualization.tsx
│   │
│   ├── services/               # Business logic
│   │   ├── llmProviders.ts     # LLM API integrations
│   │   ├── evaluationEngine.ts # Code scoring logic
│   │   └── benchmarkRunner.ts  # Execution orchestration
│   │
│   ├── types/
│   │   └── benchmark.ts        # TypeScript interfaces
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/
│   └── (static assets)
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

*Document Version: 1.0*
*Last Updated: 2026-01-30*
