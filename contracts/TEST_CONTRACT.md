# Testing Contract for API Modules

This document defines the standard testing patterns and conventions that all modules in `apps/api/src/modules/` must follow to ensure consistency, maintainability, and quality across the codebase.

---

## Table of Contents

1. [File Organization](#file-organization)
2. [Test Types](#test-types)
3. [Unit Tests (`.spec.ts`)](#unit-tests-spects)
4. [Integration Tests (`.int-spec.ts`)](#integration-tests-int-spects)
5. [Test Helpers (`*-test.helpers.ts`)](#test-helpers--test-helperts)
6. [Naming Conventions](#naming-conventions)
7. [File Structure Template](#file-structure-template)

---

## File Organization

All tests for a module must be placed in a dedicated `test/` directory within the module:

```
modules/[module-name]/
├── test/
│   ├── [resource].service.spec.ts
│   ├── [resource].repository.int-spec.ts
│   ├── [resource]-webhook.service.spec.ts
│   └── [module-name]-test.helpers.ts
├── services/
├── repositories/
├── controllers/
└── ...
```

---

## Test Types

### 1. Unit Tests (`.spec.ts`)
- **Purpose**: Test isolated business logic with mocked dependencies
- **Naming**: `[feature].service.spec.ts` or `[feature].controller.spec.ts`
- **Execution**: Always run in CI/CD pipeline
- **Scope**: Services, controllers, utilities

### 2. Integration Tests (`.int-spec.ts`)
- **Purpose**: Test database operations and complex interactions with real Prisma client
- **Naming**: `[repository].prisma.repository.int-spec.ts`
- **Execution**: Only run when `RUN_INTEGRATION_TESTS=true`
- **Scope**: Prisma repositories, database transactions
- **Requirements**: Direct database connection, real Prisma client

---

## Unit Tests (`.spec.ts`)

### Structure Template

```typescript
import { Test, type TestingModule } from '@nestjs/testing';
import { ERROR_CODES } from '@repo/shared';
import { type AppException } from 'src/common/errors/app.exception';

// Import the service under test
import { [ServiceName]Service } from '../services/[service-name].service';
import {
  type I[Repository]Repository,
  [REPOSITORY_CONSTANT],
} from '../repositories/[repository].repository';

describe('[ServiceName]Service', () => {
  let service: [ServiceName]Service;
  let [repository]: jest.Mocked<I[Repository]Repository>;

  beforeEach(async () => {
    // 1. Create mocked dependencies
    [repository] = {
      methodOne: jest.fn(),
      methodTwo: jest.fn(),
      // ... all methods
    };

    // 2. Setup NestJS testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [ServiceName]Service,
        {
          provide: [REPOSITORY_CONSTANT],
          useValue: [repository],
        },
        // Add other dependencies
      ],
    }).compile();

    service = module.get([ServiceName]Service);
  });

  // 3. Optional: clean up after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 4. Write descriptive test cases
  it('returns expected result when called with valid input', async () => {
    const mockData = { id: '1', name: 'Test' };
    [repository].methodOne.mockResolvedValue(mockData);

    const result = await service.method('user-1');

    expect(result).toEqual(mockData);
    expect([repository].methodOne).toHaveBeenCalledWith('user-1');
  });

  it('throws correct error when dependency fails', async () => {
    [repository].methodOne.mockResolvedValue(null);

    await expect(service.method('missing-id')).rejects.toMatchObject({
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
    } satisfies Partial<AppException>);
  });

  it('bubbles repository failures', async () => {
    const error = new Error('database unavailable');
    [repository].methodOne.mockRejectedValue(error);

    await expect(service.method('user-1')).rejects.toBe(error);
  });
});
```

### Unit Test Conventions

1. **Describe Block**: Use service/controller name: `describe('[Name]Service', () => { ... })`
2. **Mock Setup**: Create all mocks with `jest.fn()` before `Test.createTestingModule()`
3. **Service Access**: Get service instance with `module.get([ServiceName]Service)`
4. **Test Names**: Use clear, behavior-focused descriptions
   - ✅ `returns the wallet with available balance`
   - ✅ `throws when the user has no wallet`
   - ✅ `bubbles repository failures`
   - ❌ `test1`, ❌ `should work`
5. **Assertions**: Include both return value and method call verification
6. **Error Testing**: Test with `.rejects.toMatchObject()` for proper error validation

---

## Integration Tests (`.int-spec.ts`)

### Structure Template

```typescript
import { PrismaService } from 'src/prisma/prisma.service';
import {
  cleanModuleTestDatabase,
  createTestUser,
  createTestResource,
} from './[module]-test.helpers';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration('[Repository] integration', () => {
  let prisma: PrismaService;
  let repository: [RepositoryClass];

  // 1. Connect once before all tests
  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new [RepositoryClass](prisma);
  });

  // 2. Clean up data before each test
  beforeEach(async () => {
    await cleanModuleTestDatabase(prisma);
  });

  // 3. Clean up and disconnect after all tests
  afterAll(async () => {
    await cleanModuleTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('performs complex operation with correct data relationships', async () => {
    // 1. Arrange: Create test data
    const user = await createTestUser(prisma, { name: 'Test User' });
    const resource = await createTestResource(prisma, {
      userId: user.id,
      amount: '100000',
    });

    // 2. Act: Execute repository method
    const result = await repository.complexOperation({
      userId: user.id,
    });

    // 3. Assert: Verify data changes
    expect(result.id).toBe(resource.id);
    expect(result.status).toBe('COMPLETED');

    // Verify side effects (database state)
    const updatedResource = await prisma.resource.findUnique({
      where: { id: resource.id },
    });
    expectDecimal(updatedResource.amount, '200000');
  });

  it('is idempotent when operation runs multiple times', async () => {
    const user = await createTestUser(prisma);
    const resource = await createTestResource(prisma, { userId: user.id });

    const result1 = await repository.operation({ id: resource.id });
    const result2 = await repository.operation({ id: resource.id });

    expect(result1.id).toBe(result2.id);
    expect(result1.status).toBe(result2.status);

    const finalCount = await prisma.resource.count();
    expect(finalCount).toBe(1);
  });

  it('throws when required data is missing', async () => {
    await expect(
      repository.operation({ id: 'non-existent' }),
    ).rejects.toThrow('not found');
  });
});
```

### Integration Test Conventions

1. **Skip Condition**: Use `const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;`
2. **Lifecycle**: 
   - `beforeAll`: Connect Prisma once
   - `beforeEach`: Clean database
   - `afterAll`: Clean up and disconnect
3. **Test Data**: Use test helpers (see below) for consistent data creation
4. **Assertions**:
   - Verify return values
   - Verify database state after operation
   - Use `expectDecimal()` for Decimal comparisons
5. **Idempotency**: Test that operations are safe to retry

---

## Test Helpers (`*-test.helpers.ts`)

Every module must have a `[module-name]-test.helpers.ts` file with reusable utilities.

### Structure Template

```typescript
import {
  Prisma,
  type PrismaClient,
  type User,
  type Resource,
} from '@prisma/client';

let sequence = 0;

/**
 * Generates unique test IDs to avoid conflicts in concurrent tests
 * Format: {prefix}-{timestamp}-{sequence}
 */
export function nextTestId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

/**
 * Cleans all tables related to this module in order of foreign key dependencies
 * Clean from most dependent to least dependent
 */
export async function cleanModuleTestDatabase(prisma: PrismaClient) {
  // Most dependent tables first
  await prisma.ledgerEntry.deleteMany();
  await prisma.hold.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  
  // Independent tables
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Creates a test user with sensible defaults and customizable fields
 *
 * @param prisma - Connected Prisma client
 * @param overrides - Fields to override defaults
 * @returns Created user entity
 *
 * @example
 * const user = await createTestUser(prisma, { name: 'John' });
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<User> = {},
) {
  const unique = nextTestId('user');

  return prisma.user.create({
    data: {
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `${unique}@example.com`,
      slug: overrides.slug ?? unique,
      status: overrides.status,
      // ... other fields
    },
  });
}

/**
 * Creates a test resource with specified parameters
 *
 * @param prisma - Connected Prisma client
 * @param params - Required and optional parameters
 * @returns Created resource entity
 */
export async function createTestResource(
  prisma: PrismaClient,
  params: {
    userId: string;
    amount?: Prisma.Decimal.Value;
    status?: string;
  },
) {
  const unique = nextTestId('resource');

  return prisma.resource.create({
    data: {
      user: {
        connect: { id: params.userId },
      },
      amount: params.amount ?? 100_000,
      status: params.status ?? 'PENDING',
      internalCode: unique,
    },
  });
}

/**
 * Helper to assert Decimal values in tests
 * Prisma Decimals need string comparison
 *
 * @example
 * expectDecimal(wallet.balance, '250000');
 */
export function expectDecimal(
  value: Prisma.Decimal.Value,
  expected: string,
) {
  expect(new Prisma.Decimal(value).toString()).toBe(expected);
}
```

### Helper Conventions

1. **Imports**: Export all Prisma types needed by tests
2. **Naming**: Use `create[Entity]`, `clean[Module]TestDatabase`, `expect[Type]` patterns
3. **Defaults**: Provide sensible defaults with override capability
4. **Documentation**: Add JSDoc comments for all exported functions
5. **Unique IDs**: Use `nextTestId()` for non-unique fields
6. **Decimal Handling**: Always provide `expectDecimal()` for Prisma.Decimal comparisons
7. **Cleanup Order**: Delete in reverse order of foreign key dependencies

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Unit Test | `[name].service.spec.ts` | `wallet.service.spec.ts` |
| Unit Test | `[name].controller.spec.ts` | `deposit-order.controller.spec.ts` |
| Integration Test | `[name].int-spec.ts` | `deposit-transaction.prisma.repository.int-spec.ts` |
| Helpers | `[module]-test.helpers.ts` | `wallet-test.helpers.ts` |

### Describe Blocks

```typescript
// Services and Controllers
describe('[EntityName]Service', () => { ... })
describe('[EntityName]Controller', () => { ... })

// Integration tests
describeIntegration('[Class] integration', () => { ... })
```

### Test Cases

Use descriptive, behavior-focused names:

```typescript
// ✅ Good
it('returns the wallet with available balance', async () => { ... })
it('throws when the user has no wallet', async () => { ... })
it('bubbles repository failures', async () => { ... })
it('marks a pending deposit paid, credits wallet, and writes a ledger entry', async () => { ... })

// ❌ Bad
it('test wallet', async () => { ... })
it('should work', async () => { ... })
it('returns wallet', async () => { ... })
```

---

## File Structure Template

```
modules/[module-name]/
├── test/
│   ├── [entity].service.spec.ts
│   ├── [entity].controller.spec.ts
│   ├── [entity]-transaction.prisma.repository.int-spec.ts
│   ├── [module-name]-test.helpers.ts
│   └── README.md (optional: testing notes specific to this module)
├── services/
│   ├── [entity].service.ts
│   └── [another-entity].service.ts
├── repositories/
│   ├── [entity].repository.ts
│   ├── [entity].prisma.repository.ts
│   └── contracts/
├── controllers/
│   └── [entity].controller.ts
├── dtos/
├── entities/
├── contracts/
├── constants/
└── [module-name].module.ts
```

---

## Running Tests

### Unit Tests (Always Run)
```bash
npm test
npm test -- [module-name]
npm test -- --watch
```

### Integration Tests (When Needed)
```bash
RUN_INTEGRATION_TESTS=true npm test
RUN_INTEGRATION_TESTS=true npm test -- [module-name]
```

### Coverage Reports
```bash
npm test -- --coverage
```

---

## Key Principles

1. **Isolation**: Unit tests must never touch the database
2. **Clarity**: Test names should explain what behavior is being tested
3. **Completeness**: Test happy paths, error cases, and edge cases
4. **Consistency**: Follow patterns from existing modules
5. **Maintainability**: Use helpers to reduce duplication
6. **Speed**: Unit tests should run in milliseconds, integration tests in seconds
7. **Independence**: Tests should not depend on other tests' state
8. **Idempotency**: Tests should produce same results when run multiple times

---

## Checklist for New Modules

- [ ] Create `test/` directory with helpers file
- [ ] Write `*-test.helpers.ts` with `cleanDatabase()`, `createTest*()` functions
- [ ] Write unit tests for all services (`.spec.ts`)
- [ ] Write unit tests for all controllers (`.spec.ts`)
- [ ] Write integration tests for repositories (`.int-spec.ts`)
- [ ] All mocks use `jest.fn()`
- [ ] All test names follow naming conventions
- [ ] Helper functions have JSDoc comments
- [ ] Integration tests use `describeIntegration` skip logic
- [ ] Run `npm test` and verify all unit tests pass
- [ ] Run `RUN_INTEGRATION_TESTS=true npm test` and verify integration tests pass
- [ ] Code coverage is reasonable (aim for >80%)

---

## References

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Prisma Testing Guide](https://www.prisma.io/docs/orm/prisma-client/testing)
