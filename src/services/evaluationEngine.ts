import type { TestCase } from '@/types/benchmark';

export interface EvaluationScores {
  functionality: number;
  codeQuality: number;
  security: number;
  performance: number;
  accessibility: number;
  errorHandling: number;
  overall: number;
}

export interface EvaluationResult {
  scores: EvaluationScores;
  feedback: string[];
  details: Record<string, any>;
}

// Code analysis patterns
const PATTERNS = {
  // Functionality patterns
  hasTypeScript: (code: string) => /interface\s+\w+|type\s+\w+|=\s*\w+\s*:/.test(code),
  hasProperImports: (code: string) => /import\s+.*\s+from\s+['"]/.test(code),
  hasExports: (code: string) => /export\s+(default\s+)?/.test(code),
  hasFunctions: (code: string) => /function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*\{/.test(code),
  
  // Code quality patterns
  hasComments: (code: string) => /\/\/|\/\*[\s\S]*?\*\//.test(code),
  hasJSDoc: (code: string) => /\/\*\*\s*\n([\s\S]*?@\w+)+/.test(code),
  usesConstLet: (code: string) => /\b(const|let)\s+/.test(code),
  noVar: (code: string) => !/\bvar\s+/.test(code),
  usesArrowFunctions: (code: string) => /=>\s*\{?/.test(code),
  usesAsyncAwait: (code: string) => /\basync\b|\bawait\b/.test(code),
  usesDestructuring: (code: string) => /\{[^}]+\}\s*=|\[[^\]]+\]\s*=/.test(code),
  
  // Security patterns
  hasInputValidation: (code: string) => /validate|sanitiz|escape|encode/.test(code.toLowerCase()),
  noEval: (code: string) => !/\beval\s*\(/.test(code),
  noInnerHTML: (code: string) => !/\.innerHTML\s*=/.test(code),
  usesParameterizedQueries: (code: string) => /\$\{|\?|\$\d+/.test(code) && /query|sql|select/i.test(code),
  
  // Performance patterns
  usesMemoization: (code: string) => /useMemo|useCallback|memo|cache/.test(code),
  hasEfficientLoops: (code: string) => /\.map\(|\.filter\(|\.reduce\(|\.forEach\(/.test(code),
  noNestedLoops: (code: string) => {
    const lines = code.split('\n');
    let nestedCount = 0;
    for (const line of lines) {
      if (/for\s*\(|while\s*\(/.test(line)) nestedCount++;
    }
    return nestedCount < 3;
  },
  
  // Accessibility patterns
  hasARIA: (code: string) => /aria-[a-z]+|role=/.test(code),
  hasAltText: (code: string) => /alt=/.test(code),
  hasLabels: (code: string) => /<label|htmlFor=/.test(code),
  hasFocusManagement: (code: string) => /tabIndex|focus|blur/.test(code),
  
  // Error handling patterns
  hasTryCatch: (code: string) => /try\s*\{[\s\S]*?\}\s*catch/.test(code),
  hasErrorHandling: (code: string) => /catch|throw|Error|error/.test(code),
  hasValidation: (code: string) => /if\s*\([^)]*\)\s*\{[^}]*(?:return|throw)/.test(code),
  hasDefaultCases: (code: string) => /default\s*:/.test(code),
};

// Evaluate code based on category-specific criteria
export function evaluateCode(
  code: string,
  testCase: TestCase,
  _rawResponse: string
): EvaluationResult {
  const feedback: string[] = [];
  const details: Record<string, any> = {};
  
  // Base evaluation
  const functionality = evaluateFunctionality(code, testCase, feedback, details);
  const codeQuality = evaluateCodeQuality(code, testCase, feedback, details);
  const security = evaluateSecurity(code, testCase, feedback, details);
  const performance = evaluatePerformance(code, testCase, feedback, details);
  const accessibility = evaluateAccessibility(code, testCase, feedback, details);
  const errorHandling = evaluateErrorHandling(code, testCase, feedback, details);
  
  // Calculate overall score (weighted average)
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
  
  return {
    scores: {
      functionality,
      codeQuality,
      security,
      performance,
      accessibility,
      errorHandling,
      overall
    },
    feedback,
    details
  };
}

function evaluateFunctionality(
  code: string,
  testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 0;
  const checks = [];
  
  // Check for code presence
  if (code.length > 50) {
    score += 20;
    checks.push('Code generated');
  } else {
    feedback.push('Generated code is too short or empty');
  }
  
  // Check for TypeScript usage
  if (PATTERNS.hasTypeScript(code)) {
    score += 15;
    checks.push('TypeScript types used');
  } else {
    feedback.push('Consider using TypeScript for better type safety');
  }
  
  // Check for proper structure
  if (PATTERNS.hasProperImports(code)) {
    score += 10;
    checks.push('Imports included');
  }
  
  if (PATTERNS.hasExports(code)) {
    score += 10;
    checks.push('Exports present');
  }
  
  if (PATTERNS.hasFunctions(code)) {
    score += 15;
    checks.push('Functions/components defined');
  }
  
  // Category-specific checks
  if (testCase.category === 'frontend') {
    if (/React|import.*react/i.test(code)) {
      score += 15;
      checks.push('React usage detected');
    }
    if (/useState|useEffect|useCallback/.test(code)) {
      score += 15;
      checks.push('React hooks used');
    }
  } else if (testCase.category === 'backend') {
    if (/express|router|app\.(get|post|put|delete)/i.test(code)) {
      score += 15;
      checks.push('Express/Route handlers present');
    }
    if (/middleware|next\(/.test(code)) {
      score += 15;
      checks.push('Middleware pattern used');
    }
  } else if (testCase.category === 'testing') {
    if (/describe|it\(|test\(|expect\(/.test(code)) {
      score += 20;
      checks.push('Test structure present');
    }
    if (/mock|spyOn|jest|vi\./.test(code)) {
      score += 10;
      checks.push('Mocking used');
    }
  }
  
  details.functionalityChecks = checks;
  return Math.min(score, 100);
}

function evaluateCodeQuality(
  code: string,
  _testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 0;
  const checks = [];
  
  // Modern JavaScript/TypeScript practices
  if (PATTERNS.usesConstLet(code)) {
    score += 15;
    checks.push('Uses const/let');
  }
  
  if (PATTERNS.noVar(code)) {
    score += 10;
    checks.push('No var usage');
  } else {
    feedback.push('Avoid using "var", prefer const/let');
  }
  
  if (PATTERNS.usesArrowFunctions(code)) {
    score += 10;
    checks.push('Arrow functions used');
  }
  
  if (PATTERNS.usesAsyncAwait(code)) {
    score += 15;
    checks.push('Async/await pattern used');
  }
  
  if (PATTERNS.usesDestructuring(code)) {
    score += 10;
    checks.push('Destructuring used');
  }
  
  // Documentation
  if (PATTERNS.hasComments(code)) {
    score += 10;
    checks.push('Comments present');
  }
  
  if (PATTERNS.hasJSDoc(code)) {
    score += 15;
    checks.push('JSDoc documentation');
  }
  
  // Code length appropriateness
  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length > 10 && lines.length < 500) {
    score += 15;
    checks.push('Reasonable code length');
  }
  
  details.codeQualityChecks = checks;
  return Math.min(score, 100);
}

function evaluateSecurity(
  code: string,
  testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 50; // Base score
  const checks = [];
  
  // Security best practices
  if (PATTERNS.hasInputValidation(code)) {
    score += 20;
    checks.push('Input validation present');
  } else if (testCase.category === 'backend') {
    feedback.push('Add input validation for security');
  }
  
  if (PATTERNS.noEval(code)) {
    score += 15;
    checks.push('No eval usage');
  } else {
    score -= 30;
    feedback.push('CRITICAL: Avoid using eval()');
  }
  
  if (PATTERNS.noInnerHTML(code)) {
    score += 15;
    checks.push('No innerHTML assignment');
  } else if (testCase.category === 'frontend') {
    score -= 20;
    feedback.push('Avoid innerHTML to prevent XSS');
  }
  
  if (PATTERNS.usesParameterizedQueries(code)) {
    score += 15;
    checks.push('Parameterized queries used');
  }
  
  // Backend-specific security
  if (testCase.category === 'backend') {
    if (/bcrypt|hash|salt/.test(code)) {
      score += 10;
      checks.push('Password hashing used');
    }
    if (/jwt|token|auth/.test(code)) {
      score += 10;
      checks.push('Authentication considered');
    }
    if (/helmet|cors|rate.?limit/i.test(code)) {
      score += 10;
      checks.push('Security middleware used');
    }
  }
  
  details.securityChecks = checks;
  return Math.min(Math.max(score, 0), 100);
}

function evaluatePerformance(
  code: string,
  testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 50; // Base score
  const checks = [];
  
  // Performance patterns
  if (PATTERNS.usesMemoization(code)) {
    score += 20;
    checks.push('Memoization used');
  }
  
  if (PATTERNS.hasEfficientLoops(code)) {
    score += 15;
    checks.push('Efficient array methods used');
  }
  
  if (PATTERNS.noNestedLoops(code)) {
    score += 15;
    checks.push('No deeply nested loops');
  } else {
    feedback.push('Consider optimizing nested loops');
  }
  
  // React-specific performance
  if (testCase.category === 'frontend') {
    if (/React\.memo|useMemo|useCallback/.test(code)) {
      score += 15;
      checks.push('React optimization used');
    }
    if (/lazy|Suspense|dynamic/.test(code)) {
      score += 10;
      checks.push('Code splitting considered');
    }
  }
  
  // Backend-specific performance
  if (testCase.category === 'backend') {
    if (/cache|redis|memoize/.test(code)) {
      score += 20;
      checks.push('Caching implemented');
    }
    if (/pagination|limit|offset/.test(code)) {
      score += 15;
      checks.push('Pagination used');
    }
    if (/index|optimize|query/.test(code)) {
      score += 10;
      checks.push('Query optimization');
    }
  }
  
  details.performanceChecks = checks;
  return Math.min(score, 100);
}

function evaluateAccessibility(
  code: string,
  testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 50; // Base score
  
  // Only evaluate accessibility for frontend
  if (testCase.category !== 'frontend') {
    return 50; // Neutral score for non-frontend
  }
  
  const checks = [];
  
  if (PATTERNS.hasARIA(code)) {
    score += 20;
    checks.push('ARIA attributes used');
  }
  
  if (PATTERNS.hasAltText(code)) {
    score += 15;
    checks.push('Alt text for images');
  }
  
  if (PATTERNS.hasLabels(code)) {
    score += 15;
    checks.push('Form labels present');
  }
  
  if (PATTERNS.hasFocusManagement(code)) {
    score += 15;
    checks.push('Focus management');
  }
  
  if (/onKeyDown|onKeyUp|keyboard/.test(code)) {
    score += 15;
    checks.push('Keyboard navigation');
  }
  
  if (checks.length === 0) {
    feedback.push('Consider adding accessibility attributes (ARIA, alt text, labels)');
  }
  
  details.accessibilityChecks = checks;
  return Math.min(score, 100);
}

function evaluateErrorHandling(
  code: string,
  testCase: TestCase,
  feedback: string[],
  details: Record<string, any>
): number {
  let score = 30; // Base score
  const checks = [];
  
  if (PATTERNS.hasTryCatch(code)) {
    score += 25;
    checks.push('Try-catch blocks used');
  } else if (testCase.category !== 'testing') {
    feedback.push('Add try-catch for error handling');
  }
  
  if (PATTERNS.hasErrorHandling(code)) {
    score += 20;
    checks.push('Error handling present');
  }
  
  if (PATTERNS.hasValidation(code)) {
    score += 15;
    checks.push('Input validation');
  }
  
  if (PATTERNS.hasDefaultCases(code)) {
    score += 10;
    checks.push('Default cases handled');
  }
  
  // Backend-specific error handling
  if (testCase.category === 'backend') {
    if (/next\(error\)|error.?handler/i.test(code)) {
      score += 15;
      checks.push('Error middleware used');
    }
    if (/status\(|json\(/.test(code)) {
      score += 10;
      checks.push('Proper response formatting');
    }
  }
  
  // Testing-specific error handling
  if (testCase.category === 'testing') {
    if (/throws|rejects|toThrow/.test(code)) {
      score += 20;
      checks.push('Error cases tested');
    }
  }
  
  details.errorHandlingChecks = checks;
  return Math.min(score, 100);
}

// Generate detailed feedback based on evaluation
export function generateFeedback(result: EvaluationResult): string[] {
  const feedback = [...result.feedback];
  const scores = result.scores;
  
  if (scores.functionality < 60) {
    feedback.push('Functionality: Ensure all required features are implemented');
  }
  if (scores.codeQuality < 60) {
    feedback.push('Code Quality: Improve code structure and follow best practices');
  }
  if (scores.security < 60) {
    feedback.push('Security: Address potential security vulnerabilities');
  }
  if (scores.performance < 60) {
    feedback.push('Performance: Consider optimization techniques');
  }
  if (scores.accessibility < 60) {
    feedback.push('Accessibility: Add ARIA labels and improve keyboard navigation');
  }
  if (scores.errorHandling < 60) {
    feedback.push('Error Handling: Add comprehensive error handling');
  }
  
  return feedback;
}
