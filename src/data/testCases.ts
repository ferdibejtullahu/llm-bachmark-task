import type { TestCase } from '@/types/benchmark';

export const testCases: TestCase[] = [
  // ==================== FRONTEND TEST CASES ====================
  {
    id: 'fe-1',
    name: 'React Todo List Component',
    category: 'frontend',
    description: 'Create a functional Todo List component with add, toggle, and delete operations',
    difficulty: 'easy',
    tags: ['react', 'hooks', 'state-management', 'ui'],
    prompt: `Create a React Todo List component with the following features:
1. Input field to add new todos
2. List display of all todos
3. Toggle completion status
4. Delete individual todos
5. Filter by: All, Active, Completed
6. Show count of remaining items
7. Clear all completed button

Use TypeScript and functional components with hooks. Include proper styling with CSS modules or inline styles.`,
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'All features work correctly',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('useState') && code.includes('onChange') && code.includes('filter') ? 10 : 5,
          maxScore: 10,
          feedback: 'State management and event handlers present'
        })
      },
      {
        name: 'Code Quality',
        description: 'Clean, readable, well-structured code',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('interface') || code.includes('type') ? 10 : 6,
          maxScore: 10,
          feedback: 'TypeScript types usage checked'
        })
      },
      {
        name: 'Accessibility',
        description: 'ARIA labels, keyboard navigation',
        weight: 0.15,
        check: (code: string) => ({
          score: code.includes('aria-') || code.includes('role=') ? 10 : 4,
          maxScore: 10,
          feedback: 'Accessibility attributes checked'
        })
      }
    ]
  },
  {
    id: 'fe-2',
    name: 'Form Validation Component',
    category: 'frontend',
    description: 'Create a user registration form with comprehensive validation',
    difficulty: 'medium',
    tags: ['react', 'forms', 'validation', 'typescript'],
    prompt: `Create a React user registration form with the following requirements:
1. Fields: email, password, confirm password, username
2. Real-time validation with error messages
3. Email format validation
4. Password: min 8 chars, 1 uppercase, 1 number, 1 special char
5. Password match validation
6. Username: 3-20 alphanumeric characters
7. Submit button disabled until valid
8. Show success message on valid submit

Use TypeScript and implement custom validation logic.`,
    evaluationCriteria: [
      {
        name: 'Validation Logic',
        description: 'All validation rules implemented',
        weight: 0.35,
        check: (code: string) => ({
          score: code.includes('regex') || code.includes('test(') || code.includes('match(') ? 10 : 5,
          maxScore: 10,
          feedback: 'Validation patterns checked'
        })
      },
      {
        name: 'User Experience',
        description: 'Real-time feedback and error handling',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('useEffect') && code.includes('error') ? 10 : 6,
          maxScore: 10,
          feedback: 'Dynamic validation checked'
        })
      }
    ]
  },
  {
    id: 'fe-3',
    name: 'Data Table with Sorting & Pagination',
    category: 'frontend',
    description: 'Create a reusable data table component with advanced features',
    difficulty: 'medium',
    tags: ['react', 'table', 'sorting', 'pagination', 'reusable'],
    prompt: `Create a reusable DataTable component with:
1. Accept generic data prop with TypeScript generics
2. Configurable columns with headers
3. Sortable columns (ascending/descending)
4. Pagination with configurable page size
5. Search/filter functionality
6. Row selection (single/multi)
7. Empty state handling
8. Loading state support

Make it fully typed and reusable across different data types.`,
    evaluationCriteria: [
      {
        name: 'Generics Usage',
        description: 'Proper TypeScript generic implementation',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('<T') || code.includes('extends') ? 10 : 4,
          maxScore: 10,
          feedback: 'Generic type usage checked'
        })
      },
      {
        name: 'Features',
        description: 'All table features implemented',
        weight: 0.35,
        check: (code: string) => ({
          score: (code.match(/sort|pagination|filter|select/gi) || []).length > 3 ? 10 : 6,
          maxScore: 10,
          feedback: 'Table features presence checked'
        })
      }
    ]
  },
  {
    id: 'fe-4',
    name: 'Custom Hook - useFetch',
    category: 'frontend',
    description: 'Create a custom React hook for data fetching with caching',
    difficulty: 'medium',
    tags: ['react', 'hooks', 'fetch', 'caching', 'async'],
    prompt: `Create a custom useFetch hook with:
1. Accept URL and options
2. Handle loading, error, and data states
3. Automatic retry on failure (configurable)
4. Request cancellation on unmount
5. Cache responses (configurable TTL)
6. Refetch functionality
7. Poll interval support
8. TypeScript generics for response type

Return { data, loading, error, refetch, cancel }`,
    evaluationCriteria: [
      {
        name: 'Hook Implementation',
        description: 'Proper hook structure and cleanup',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('useEffect') && code.includes('AbortController') ? 10 : 5,
          maxScore: 10,
          feedback: 'Effect cleanup and abort checked'
        })
      },
      {
        name: 'Caching',
        description: 'Cache implementation with TTL',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('cache') || code.includes('Map') || code.includes('localStorage') ? 10 : 4,
          maxScore: 10,
          feedback: 'Caching mechanism checked'
        })
      }
    ]
  },
  {
    id: 'fe-5',
    name: 'Modal Dialog with Focus Trap',
    category: 'frontend',
    description: 'Create an accessible modal dialog with focus management',
    difficulty: 'hard',
    tags: ['react', 'modal', 'accessibility', 'focus-trap', 'portal'],
    prompt: `Create an accessible Modal component:
1. Render using React Portal
2. Focus trap inside modal when open
3. Close on Escape key
4. Close on backdrop click
5. Return focus to trigger on close
6. Lock body scroll when open
7. ARIA attributes (role, aria-modal, aria-labelledby)
8. Support for header, body, footer slots
9. Animation/transition support
10. TypeScript props interface

Ensure full accessibility compliance.`,
    evaluationCriteria: [
      {
        name: 'Accessibility',
        description: 'ARIA and focus management',
        weight: 0.35,
        check: (code: string) => ({
          score: code.includes('createPortal') && code.includes('aria-') && code.includes('Escape') ? 10 : 5,
          maxScore: 10,
          feedback: 'Portal and ARIA attributes checked'
        })
      },
      {
        name: 'Focus Management',
        description: 'Focus trap and restoration',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('focus') && code.includes('tabindex') ? 10 : 5,
          maxScore: 10,
          feedback: 'Focus handling checked'
        })
      }
    ]
  },

  // ==================== BACKEND TEST CASES ====================
  {
    id: 'be-1',
    name: 'REST API - User CRUD',
    category: 'backend',
    description: 'Create a RESTful API for user management with Express',
    difficulty: 'easy',
    tags: ['nodejs', 'express', 'rest', 'crud', 'api'],
    prompt: `Create an Express.js REST API for user management:
1. GET /users - List all users (with pagination)
2. GET /users/:id - Get single user
3. POST /users - Create new user (validate email, name)
4. PUT /users/:id - Update user
5. DELETE /users/:id - Delete user
6. Input validation middleware
7. Error handling middleware
8. In-memory storage (array/Map)
9. Proper HTTP status codes
10. JSON responses

Use TypeScript and include type definitions.`,
    evaluationCriteria: [
      {
        name: 'CRUD Operations',
        description: 'All CRUD endpoints implemented',
        weight: 0.3,
        check: (code: string) => ({
          score: ['get', 'post', 'put', 'delete'].every(m => code.toLowerCase().includes(m)) ? 10 : 5,
          maxScore: 10,
          feedback: 'HTTP methods coverage checked'
        })
      },
      {
        name: 'Validation',
        description: 'Input validation present',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('validation') || code.includes('validate') || code.includes('middleware') ? 10 : 5,
          maxScore: 10,
          feedback: 'Validation middleware checked'
        })
      }
    ]
  },
  {
    id: 'be-2',
    name: 'JWT Authentication Middleware',
    category: 'backend',
    description: 'Implement JWT-based authentication with refresh tokens',
    difficulty: 'medium',
    tags: ['nodejs', 'jwt', 'authentication', 'security', 'middleware'],
    prompt: `Create JWT authentication system:
1. Login endpoint - validate credentials, return JWT + refresh token
2. JWT middleware - verify access token
3. Refresh token endpoint - issue new access token
4. Logout endpoint - invalidate refresh token
5. Token expiration handling
6. Secure password hashing (bcrypt)
7. Role-based access control (RBAC)
8. Rate limiting for auth endpoints
9. Token blacklisting
10. TypeScript interfaces

Include proper error handling and security measures.`,
    evaluationCriteria: [
      {
        name: 'Security',
        description: 'Secure token handling and password hashing',
        weight: 0.35,
        check: (code: string) => ({
          score: code.includes('bcrypt') && code.includes('jwt') && code.includes('expires') ? 10 : 5,
          maxScore: 10,
          feedback: 'Security libraries usage checked'
        })
      },
      {
        name: 'Token Flow',
        description: 'Proper JWT and refresh token flow',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('refresh') && code.includes('verify') ? 10 : 5,
          maxScore: 10,
          feedback: 'Token verification checked'
        })
      }
    ]
  },
  {
    id: 'be-3',
    name: 'Database Operations with Prisma',
    category: 'backend',
    description: 'Create database models and CRUD operations using Prisma ORM',
    difficulty: 'medium',
    tags: ['nodejs', 'prisma', 'database', 'orm', 'relations'],
    prompt: `Create a blog API with Prisma ORM:
1. Schema: User, Post, Comment models
2. Relations: User-Posts (1:N), Post-Comments (1:N), User-Comments (1:N)
3. CRUD for all entities
4. Include related data in queries
5. Pagination for lists
6. Transaction support
7. Soft delete implementation
8. Database seeding script
9. Environment configuration
10. Error handling

Use TypeScript and include Prisma schema definition.`,
    evaluationCriteria: [
      {
        name: 'Schema Design',
        description: 'Proper model relations',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('@relation') && code.includes('model') ? 10 : 5,
          maxScore: 10,
          feedback: 'Prisma relations checked'
        })
      },
      {
        name: 'Query Complexity',
        description: 'Advanced queries with includes',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('include') && code.includes('transaction') ? 10 : 5,
          maxScore: 10,
          feedback: 'Query optimization checked'
        })
      }
    ]
  },
  {
    id: 'be-4',
    name: 'Rate Limiting & Caching',
    category: 'backend',
    description: 'Implement rate limiting and Redis caching middleware',
    difficulty: 'medium',
    tags: ['nodejs', 'redis', 'caching', 'rate-limiting', 'performance'],
    prompt: `Create caching and rate limiting solution:
1. Redis connection setup
2. Cache middleware - cache GET responses
3. Cache invalidation strategies
4. Rate limiter - per IP and per user
5. Different tiers: 100 req/min anonymous, 1000 req/min authenticated
6. Rate limit headers (X-RateLimit-*)
7. Circuit breaker pattern
8. Cache warming strategy
9. Error fallback when Redis down
10. TypeScript implementation

Ensure high performance and reliability.`,
    evaluationCriteria: [
      {
        name: 'Caching',
        description: 'Redis caching implementation',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('redis') && code.includes('cache') ? 10 : 5,
          maxScore: 10,
          feedback: 'Redis usage checked'
        })
      },
      {
        name: 'Rate Limiting',
        description: 'Proper rate limit implementation',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('rate') && code.includes('limit') ? 10 : 5,
          maxScore: 10,
          feedback: 'Rate limiting checked'
        })
      }
    ]
  },
  {
    id: 'be-5',
    name: 'WebSocket Real-time Chat',
    category: 'backend',
    description: 'Build a real-time chat server with WebSockets',
    difficulty: 'hard',
    tags: ['nodejs', 'websocket', 'socket.io', 'real-time', 'chat'],
    prompt: `Create a real-time chat server:
1. Socket.io setup with Express
2. User connection/authentication
3. Join/leave chat rooms
4. Send/receive messages
5. Message persistence (in-memory)
6. Typing indicators
7. Online user list
8. Message history on join
9. Private messaging
10. Message reactions
11. Error handling and reconnection
12. TypeScript types for events

Include room management and event handling.`,
    evaluationCriteria: [
      {
        name: 'WebSocket Implementation',
        description: 'Proper Socket.io usage',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('socket.io') && code.includes('on(') && code.includes('emit') ? 10 : 5,
          maxScore: 10,
          feedback: 'Socket.io patterns checked'
        })
      },
      {
        name: 'Features',
        description: 'Chat features implemented',
        weight: 0.35,
        check: (code: string) => ({
          score: (code.match(/room|private|typing|reaction/gi) || []).length > 3 ? 10 : 6,
          maxScore: 10,
          feedback: 'Chat features checked'
        })
      }
    ]
  },

  // ==================== TESTING TEST CASES ====================
  {
    id: 'test-1',
    name: 'Unit Tests - Utility Functions',
    category: 'testing',
    description: 'Write comprehensive unit tests for utility functions',
    difficulty: 'easy',
    tags: ['jest', 'unit-testing', 'utilities', 'typescript'],
    prompt: `Write Jest unit tests for these utility functions:
1. formatDate(date: Date, format: string): string - Format dates
2. parseQueryString(url: string): Record<string, string> - Parse URL params
3. debounce(fn: Function, delay: number): Function - Debounce function
4. deepClone<T>(obj: T): T - Deep clone objects
5. groupBy<T>(array: T[], key: keyof T): Record<string, T[]> - Group array items

Include:
- Happy path tests
- Edge cases (null, undefined, empty)
- Error cases
- Async tests where applicable
- Proper test descriptions
- TypeScript types

Test coverage should be comprehensive.`,
    evaluationCriteria: [
      {
        name: 'Test Coverage',
        description: 'All functions tested',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('describe') && code.includes('it(') && code.includes('expect') ? 10 : 5,
          maxScore: 10,
          feedback: 'Test structure checked'
        })
      },
      {
        name: 'Edge Cases',
        description: 'Edge cases and error handling tested',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('null') && code.includes('undefined') && code.includes('throw') ? 10 : 5,
          maxScore: 10,
          feedback: 'Edge case coverage checked'
        })
      }
    ]
  },
  {
    id: 'test-2',
    name: 'React Component Tests',
    category: 'testing',
    description: 'Write tests for React components using React Testing Library',
    difficulty: 'medium',
    tags: ['react', 'testing-library', 'jest', 'components'],
    prompt: `Write tests for a LoginForm component:
1. Render test - form elements present
2. Input change tests - updates state
3. Validation tests - shows errors for invalid input
4. Submit test - calls onSubmit with form data
5. Loading state test - shows spinner during submit
6. Error display test - shows API error messages
7. Success redirect test - redirects on success
8. Accessibility tests - proper labels and roles

Use React Testing Library and Jest.
Include proper setup, mocks, and cleanup.
Test user interactions realistically.`,
    evaluationCriteria: [
      {
        name: 'Interaction Testing',
        description: 'User interactions tested',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('fireEvent') || code.includes('userEvent') ? 10 : 5,
          maxScore: 10,
          feedback: 'Interaction testing checked'
        })
      },
      {
        name: 'Query Methods',
        description: 'Proper RTL query usage',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('getBy') || code.includes('findBy') || code.includes('queryBy') ? 10 : 5,
          maxScore: 10,
          feedback: 'RTL queries checked'
        })
      }
    ]
  },
  {
    id: 'test-3',
    name: 'API Integration Tests',
    category: 'testing',
    description: 'Write integration tests for API endpoints with supertest',
    difficulty: 'medium',
    tags: ['nodejs', 'supertest', 'integration', 'api', 'jest'],
    prompt: `Write integration tests for a Task API:
1. GET /tasks - returns task list
2. GET /tasks/:id - returns single task
3. POST /tasks - creates new task
4. PUT /tasks/:id - updates task
5. DELETE /tasks/:id - deletes task
6. Error cases - 404, 400, 500 responses
7. Validation errors - invalid input data
8. Database state verification
9. Cleanup after tests

Use supertest for HTTP requests.
Mock external services.
Test database interactions.
Include setup and teardown.`,
    evaluationCriteria: [
      {
        name: 'HTTP Testing',
        description: 'All endpoints tested',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('supertest') && code.includes('.get') && code.includes('.post') ? 10 : 5,
          maxScore: 10,
          feedback: 'Supertest usage checked'
        })
      },
      {
        name: 'Assertions',
        description: 'Response validation',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('expect') && code.includes('status') && code.includes('body') ? 10 : 5,
          maxScore: 10,
          feedback: 'Response assertions checked'
        })
      }
    ]
  },
  {
    id: 'test-4',
    name: 'E2E Tests with Cypress',
    category: 'testing',
    description: 'Write end-to-end tests for a complete user workflow',
    difficulty: 'medium',
    tags: ['cypress', 'e2e', 'automation', 'workflow'],
    prompt: `Write Cypress E2E tests for e-commerce checkout:
1. User login flow
2. Product search and selection
3. Add to cart functionality
4. Cart review and modifications
5. Checkout process
6. Payment form validation
7. Order confirmation
8. Order history verification

Include:
- Page object pattern
- Custom commands
- Fixtures for test data
- Environment configuration
- Screenshots on failure
- Video recording config
- Parallel execution setup

Test the complete user journey.`,
    evaluationCriteria: [
      {
        name: 'E2E Coverage',
        description: 'Complete workflow tested',
        weight: 0.35,
        check: (code: string) => ({
          score: code.includes('cy.') && code.includes('visit') && code.includes('click') ? 10 : 5,
          maxScore: 10,
          feedback: 'Cypress commands checked'
        })
      },
      {
        name: 'Test Organization',
        description: 'Page objects and custom commands',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('class') || code.includes('Cypress.Commands') ? 10 : 5,
          maxScore: 10,
          feedback: 'Test organization checked'
        })
      }
    ]
  },
  {
    id: 'test-5',
    name: 'Mock Data Generation',
    category: 'testing',
    description: 'Create comprehensive mock data generators for testing',
    difficulty: 'easy',
    tags: ['faker', 'mocking', 'fixtures', 'test-data'],
    prompt: `Create mock data generators using @faker-js/faker:
1. User generator - name, email, avatar, role, preferences
2. Product generator - name, price, category, inventory, images
3. Order generator - items, total, status, shipping, payment
4. Review generator - rating, comment, author, date
5. Company generator - name, address, employees, revenue

Features:
- Configurable quantity
- Seeded randomness (reproducible)
- Relationships between entities
- Realistic data patterns
- TypeScript interfaces
- Export as JSON/TS/JS

Make it reusable for different test scenarios.`,
    evaluationCriteria: [
      {
        name: 'Data Realism',
        description: 'Realistic mock data',
        weight: 0.3,
        check: (code: string) => ({
          score: code.includes('faker') && code.includes('seed') ? 10 : 5,
          maxScore: 10,
          feedback: 'Faker usage checked'
        })
      },
      {
        name: 'Flexibility',
        description: 'Configurable generators',
        weight: 0.25,
        check: (code: string) => ({
          score: code.includes('interface') && code.includes('options') ? 10 : 5,
          maxScore: 10,
          feedback: 'Configuration options checked'
        })
      }
    ]
  }
];

export const getTestCaseById = (id: string): TestCase | undefined => {
  return testCases.find(tc => tc.id === id);
};

export const getTestCasesByCategory = (category: string): TestCase[] => {
  return testCases.filter(tc => tc.category === category);
};

export const categories = [
  { id: 'frontend', name: 'Frontend Development', icon: 'Layout', color: '#3b82f6' },
  { id: 'backend', name: 'Backend Development', icon: 'Server', color: '#10b981' },
  { id: 'testing', name: 'Test Generation', icon: 'TestTube', color: '#f59e0b' }
] as const;

// Custom test cases storage
const CUSTOM_TEST_CASES_KEY = 'benchmark_custom_test_cases';

export const getCustomTestCases = (): TestCase[] => {
  try {
    const saved = localStorage.getItem(CUSTOM_TEST_CASES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Restore the evaluation check functions
      return parsed.map((tc: any) => ({
        ...tc,
        evaluationCriteria: tc.evaluationCriteria?.map((ec: any) => ({
          ...ec,
          check: getDefaultCheckFunction(ec.name)
        })) || []
      }));
    }
  } catch {}
  return [];
};

export const saveCustomTestCase = (testCase: TestCase): void => {
  try {
    const existing = getCustomTestCases();
    const updated = [...existing.filter(tc => tc.id !== testCase.id), testCase];
    localStorage.setItem(CUSTOM_TEST_CASES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save custom test case:', error);
  }
};

export const deleteCustomTestCase = (id: string): void => {
  try {
    const existing = getCustomTestCases();
    const updated = existing.filter(tc => tc.id !== id);
    localStorage.setItem(CUSTOM_TEST_CASES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete custom test case:', error);
  }
};

export const getAllTestCases = (): TestCase[] => {
  return [...testCases, ...getCustomTestCases()];
};

// Default check function for custom test cases
const getDefaultCheckFunction = (criterionName: string) => {
  return (code: string) => {
    const checks: Record<string, () => { score: number; maxScore: number; feedback: string }> = {
      'Functionality': () => ({
        score: code.length > 100 ? 8 : 5,
        maxScore: 10,
        feedback: 'Code length check'
      }),
      'Code Quality': () => ({
        score: code.includes('interface') || code.includes('type') ? 8 : 5,
        maxScore: 10,
        feedback: 'TypeScript usage check'
      }),
      'Security': () => ({
        score: !code.includes('eval(') && !code.includes('innerHTML') ? 8 : 4,
        maxScore: 10,
        feedback: 'Security patterns check'
      }),
      'Performance': () => ({
        score: code.includes('useMemo') || code.includes('useCallback') || code.includes('cache') ? 7 : 5,
        maxScore: 10,
        feedback: 'Optimization patterns check'
      }),
      'Accessibility': () => ({
        score: code.includes('aria-') || code.includes('alt=') ? 7 : 4,
        maxScore: 10,
        feedback: 'Accessibility attributes check'
      }),
      'Error Handling': () => ({
        score: code.includes('try') && code.includes('catch') ? 8 : 4,
        maxScore: 10,
        feedback: 'Error handling check'
      })
    };
    return (checks[criterionName] || checks['Functionality'])();
  };
};
