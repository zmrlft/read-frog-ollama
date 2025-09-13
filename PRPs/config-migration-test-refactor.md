name: "Config Migration Test Refactoring - Multi-Series Map Structure"
description: |

---

## Goal

**Feature Goal**: Refactor config migration testing to support multiple test series that can span different version ranges, enabling comprehensive testing of diverse configuration scenarios across migration paths.

**Deliverable**: A new object-based test structure in `apps/extension/src/utils/config/__tests__/example/` that supports multiple test series with different version ranges and comprehensive test coverage.

**Success Definition**: All existing migration tests pass with the new structure, plus new test series are added to cover edge cases and complex migration scenarios previously untestable.

## User Persona (if applicable)

**Target User**: Extension developers and QA engineers testing config migrations

**Use Case**: Testing config migrations with various field combinations and edge cases across different version ranges

**User Journey**:

1. Developer adds a new config field in version X
2. Developer creates test series starting at version X with various field combinations
3. Test framework automatically runs all applicable migrations for each series
4. Developer gets comprehensive validation of migration correctness

**Pain Points Addressed**:

- Current limitation of one test example per version
- Cannot test rich field combinations in newer versions
- Cannot test partial version ranges (e.g., v6-v10 only)

## Why

- Enables comprehensive testing of config migrations with diverse scenarios
- Allows testing of features that appear and disappear across versions
- Improves confidence in migration correctness for edge cases
- Maintains backward compatibility with existing test structure

## What

Create an object-based test structure where:

- Each test file contains an object with test series as keys
- Each series has a description and config object
- Migration tests automatically detect series by checking if the same series key exists in both current and previous version files
- If a series exists in current version but not in previous version, no migration test is run for that series
- Existing single-example structure remains supported

### Success Criteria

- [ ] All existing 21 migration tests continue to pass
- [ ] New object-based test structure supports multiple series per version
- [ ] Test series are automatically detected based on presence in consecutive versions
- [ ] At least 10 new test series added covering edge cases
- [ ] Clear error messages when migrations fail
- [ ] Backward compatibility with existing test files

## All Needed Context

### Context Completeness Check

_Before writing this PRP, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://vitest.dev/guide/migration.html#test-data-organization
  why: Vitest patterns for organizing complex test data structures
  critical: Dynamic imports and Map-based test organization patterns

- url: https://dev.to/testamplify/part-4data-structures-in-typescript-organizing-test-data-with-strong-typing-296p
  why: TypeScript patterns for organizing test data with Maps
  critical: Strong typing for test data structures and Map usage

- file: apps/extension/src/utils/config/__tests__/migration-scripts/all-migrations.test.ts
  why: Current test implementation that needs refactoring
  pattern: Dynamic version loading, automated test generation
  gotcha: Must maintain backward compatibility with existing structure

- file: apps/extension/src/utils/config/__tests__/example/v022.ts
  why: Latest version example showing current structure
  pattern: Export pattern for configExample and description
  gotcha: Some versions lack description field

- file: apps/extension/src/utils/config/migration-scripts/types.ts
  why: Type definitions for migrations
  pattern: MigrationFunction and MigrationModule interfaces
  gotcha: Uses 'any' types for flexibility
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
apps/extension/src/utils/config/
├── __tests__/
│   ├── config.test.ts                           # Config utility tests
│   ├── migration-scripts/
│   │   ├── README.md                           # Migration test documentation
│   │   └── all-migrations.test.ts              # Main migration test file
│   └── example/                                # Test data directory
│       ├── v001.ts                             # Version 1 example
│       ├── v002.ts                             # Version 2 example
│       ├── ...
│       └── v022.ts                             # Version 22 example
├── migration-scripts/
│   ├── types.ts                                # Migration types
│   ├── v001-to-v002.ts                         # Migration script 1→2
│   ├── ...
│   └── v021-to-v022.ts                         # Migration script 21→22
├── config.ts                                   # Config utilities
├── helpers.ts                                  # Helper functions
├── init.ts                                     # Config initialization
└── migration.ts                                # Migration orchestration
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
apps/extension/src/utils/config/
├── __tests__/
│   ├── config.test.ts                           # Config utility tests
│   ├── migration-scripts/
│   │   ├── README.md                           # Updated documentation
│   │   └── all-migrations.test.ts              # Refactored to support Map structure
│   └── example/
│       ├── types.ts                            # NEW: Test data type definitions
│       ├── v001.ts                             # Refactored: Map structure or legacy
│       ├── v002.ts                             # Refactored: Map structure or legacy
│       ├── ...
│       └── v022.ts                             # Refactored: Map structure or legacy
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Vitest dynamic imports use import.meta.glob() not require()
// Example: const modules = import.meta.glob('./example/v*.ts')

// CRITICAL: Some early versions (v001-v010) lack description field
// Handle missing description gracefully with optional chaining

// CRITICAL: Migration functions use 'any' type for flexibility
// Don't attempt to add strict typing - will break existing migrations

// CRITICAL: Test files use zero-padded version numbers (v001, not v1)
// Maintain this convention in all new code

// CRITICAL: CONFIG_SCHEMA_VERSION constant must stay in sync
// Located in apps/extension/src/utils/config/constants.ts
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.

```typescript
// apps/extension/src/utils/config/__tests__/example/types.ts
export interface TestSeriesConfig {
  description: string
  config: any // Must use 'any' to match migration function signatures
}

export type TestSeriesObject = Record<string, TestSeriesConfig>

export interface VersionTestData {
  // For backward compatibility
  configExample?: any
  description?: string
  // New object-based structure
  testSeries?: TestSeriesObject
}

// TestSeriesMetadata removed - series discovery is automatic based on file presence
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE apps/extension/src/utils/config/__tests__/example/types.ts
  - IMPLEMENT: TypeScript interfaces for test series structure
  - FOLLOW pattern: apps/extension/src/utils/config/migration-scripts/types.ts
  - NAMING: TestSeriesConfig, TestSeriesObject, VersionTestData interfaces
  - PLACEMENT: New file in example directory
  - CRITICAL: Use 'any' type for config to match migration functions

Task 2: REFACTOR apps/extension/src/utils/config/__tests__/example/v006.ts through v010.ts
  - IMPLEMENT: Convert to object-based structure with multiple test series
  - FOLLOW pattern: Export testSeries object alongside legacy configExample
  - NAMING: Keep existing exports, add new testSeries export
  - DEPENDENCIES: Import types from Task 1
  - BACKWARD COMPATIBILITY: Maintain configExample export

Task 3: CREATE new test series in v015.ts through v020.ts
  - IMPLEMENT: Add edge case test series (empty lists, undefined fields, etc.)
  - FOLLOW pattern: Object structure from Task 2
  - NAMING: Descriptive series keys like "empty-providers", "max-config"
  - DEPENDENCIES: Import types from Task 1
  - COVERAGE: Test previously untestable scenarios

Task 4: REFACTOR apps/extension/src/utils/config/__tests__/migration-scripts/all-migrations.test.ts
  - IMPLEMENT: Support both object-based and legacy test structures
  - FOLLOW pattern: Existing dynamic import and test generation
  - NAMING: Keep existing test naming conventions
  - DEPENDENCIES: Import types from Task 1, test data from Tasks 2-3
  - CRITICAL: Maintain backward compatibility with non-object files

Task 5: UPDATE apps/extension/src/utils/config/__tests__/migration-scripts/README.md
  - IMPLEMENT: Document new object-based test structure
  - FOLLOW pattern: Existing documentation style
  - NAMING: Clear section headers for new features
  - DEPENDENCIES: Reference all new files and patterns
  - EXAMPLES: Show how to add new test series
```

### Implementation Patterns & Key Details

```typescript
// Example: Object-based test file structure (v006.ts and later)
import type { TestSeriesObject } from './types'

// Legacy export for backward compatibility
export const description = 'Add Ollama provider configuration'
export const configExample = { /* existing config */ }

// New object-based structure
export const testSeries: TestSeriesObject = {
  'default': {
    description: 'Standard migration with typical settings',
    config: configExample // Reuse existing for backward compatibility
  },
  'empty-providers': {
    description: 'Migration with empty provider list',
    config: {
      providersConfig: [],
      // ... other fields
    }
  },
  'ollama-only': {
    description: 'Config with only Ollama provider',
    config: {
      providersConfig: [
        { type: 'ollama', apiKey: 'test-key' }
      ],
      // ... other fields
    }
  }
}

// Example: Refactored test runner (all-migrations.test.ts)
// No central registry needed - series discovery is automatic
for (let version = 2; version <= LATEST_SCHEMA_VERSION; version++) {
  const fromVersionStr = String(version - 1).padStart(3, '0')
  const toVersionStr = String(version).padStart(3, '0')

  // Try to import test data
  const oldConfigModule = await import(`../example/v${fromVersionStr}.ts`)
  const newConfigModule = await import(`../example/v${toVersionStr}.ts`)

  // Check for object-based structure
  if (oldConfigModule.testSeries && newConfigModule.testSeries) {
    // Test each series that exists in both versions
    for (const [seriesId, oldSeriesData] of Object.entries(oldConfigModule.testSeries)) {
      const newSeriesData = newConfigModule.testSeries[seriesId]
      if (newSeriesData) {
        it(`should migrate "${seriesId}" from v${version - 1} to v${version}`, async () => {
          const migrated = await runMigration(version, oldSeriesData.config)
          expect(migrated).toEqual(newSeriesData.config)
        })
      }
    }
  }
  else {
    // Fallback to legacy structure
    it(`should migrate config from v${version - 1} to v${version}`, async () => {
      const oldConfig = oldConfigModule.configExample
      const expectedNewConfig = newConfigModule.configExample
      const actualNewConfig = await runMigration(version, oldConfig)
      expect(actualNewConfig).toEqual(expectedNewConfig)
    })
  }
}
```

### Integration Points

```yaml
TESTING:
  - framework: Vitest with TypeScript support
  - imports: Use import.meta.glob() for dynamic imports
  - pattern: Maintain existing test discovery pattern

CONFIG:
  - constant: CONFIG_SCHEMA_VERSION in constants.ts
  - pattern: 'Zero-padded version numbers (v001, not v1)'
  - validation: Schema validation remains unchanged

MIGRATION:
  - scripts: No changes to migration scripts
  - types: Migration functions continue using 'any'
  - execution: runMigration() function unchanged
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
cd apps/extension
pnpm lint                    # ESLint checks with TypeScript rules
pnpm type-check              # TypeScript type checking

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the refactored migration tests
cd apps/extension
pnpm test migration-scripts

# Test with verbose output to see all series
VITEST_VERBOSE=1 pnpm test migration-scripts

# Test specific version migrations
pnpm test -- --grep "v006"

# Run with coverage
pnpm test:cov migration-scripts

# Expected: All tests pass, new test series show in output
```

### Level 3: Integration Testing (System Validation)

```bash
# Full test suite validation
cd apps/extension
pnpm test

# Verify all migration paths
for i in {2..22}; do
  echo "Testing migration to v$i"
  pnpm test -- --grep "to v$(printf %03d $i)"
done

# Validate test count increased
pnpm test migration-scripts 2>&1 | grep -E "([0-9]+) passed"
# Expected: More tests than the original 21 (due to multiple series)

# Verify backward compatibility
git stash  # Save changes
pnpm test migration-scripts  # Run original tests
git stash pop  # Restore changes
pnpm test migration-scripts  # Run new tests
# Expected: All original tests still pass
```

## Final Validation Checklist

### Technical Validation

- [ ] All validation levels completed successfully
- [ ] All tests pass: `pnpm test migration-scripts`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] Test count increased from original 21 tests

### Feature Validation

- [ ] Multiple test series per version working
- [ ] Series can span partial version ranges
- [ ] At least 10 new test series added
- [ ] Clear error messages for failed migrations
- [ ] Backward compatibility maintained

### Code Quality Validation

- [ ] Follows existing TypeScript patterns
- [ ] File placement matches desired structure
- [ ] Uses 'any' type for migration compatibility
- [ ] Zero-padded version numbers maintained
- [ ] Dynamic imports use import.meta.glob()

### TypeScript/Vitest Specific

- [ ] Test data interfaces properly defined
- [ ] Object structures typed correctly
- [ ] Optional chaining for missing descriptions
- [ ] Vitest test generation patterns followed
- [ ] No breaking changes to existing tests

### Documentation & Deployment

- [ ] README.md updated with new structure
- [ ] Example code shows object usage
- [ ] Test series registry documented
- [ ] Migration from old to new structure explained

---

## Anti-Patterns to Avoid

- ❌ Don't add strict typing to migration functions - breaks compatibility
- ❌ Don't change version number padding (v001 format)
- ❌ Don't modify existing migration scripts
- ❌ Don't break backward compatibility with legacy structure
- ❌ Don't use require() - use import.meta.glob()
- ❌ Don't use Map for test series - use plain objects
- ❌ Don't hardcode version numbers - use CONFIG_SCHEMA_VERSION
