# Active Context - WP Engine Customer API Documentation

## Current Work Focus

### Recently Completed (January 27, 2025)
1. **Repository Cleanup**
   - ✅ Updated navigation structure in `astro.config.mjs`
   - ✅ Removed SDK Examples from navigation (files preserved)
   - ✅ Created new "Try!" section for API Playground
   - ✅ Moved playground from `api-reference/playground.mdx` to `try/playground.mdx`
   - ✅ Updated index page to redirect to Getting Started
   - ✅ Fixed SwaggerUI component OpenAPI path reference

2. **Documentation Standards**
   - ✅ Created comprehensive `.clinerules` file
   - ✅ Established content marker system for auto-generated vs human content
   - ✅ Defined branching and review strategy
   - ✅ Set up memory bank structure with project context

3. **Memory Bank Creation**
   - ✅ `project_brief.md` - Original project requirements
   - ✅ `productContext.md` - User personas and experience goals
   - ✅ `systemPatterns.md` - Technical architecture and patterns
   - ✅ `techContext.md` - Technology stack and constraints
   - ✅ `activeContext.md` - Current status and next steps
   - ✅ `automationWorkflows.md` - Complete automation and deployment strategy

4. **Automation Strategy Documentation**
   - ✅ Updated `.clinerules` with comprehensive automation workflows
   - ✅ External OpenAPI spec monitoring strategy
   - ✅ WP Engine preview environment integration
   - ✅ GitHub Actions pipeline specifications
   - ✅ Internal development documentation structure

## Current Implementation Status

### Phase 1: Foundation (COMPLETED)
- [x] Repository structure cleanup
- [x] Navigation reorganization
- [x] Documentation standards establishment
- [x] Memory bank creation
- [x] Content marker system design

### Phase 2: Core Generation System (NEXT)
- [ ] OpenAPI parser implementation
- [ ] Template system creation
- [ ] Documentation generator script
- [ ] Navigation updater script
- [ ] Basic validation system

### Phase 3: Enhanced Features (PLANNED)
- [ ] Multi-language code example generation
- [ ] Incremental update system
- [ ] Content preservation logic
- [ ] Advanced validation pipeline

### Phase 4: Automation (PLANNED)
- [ ] GitHub Actions workflow
- [ ] External repository monitoring
- [ ] Automated PR creation
- [ ] WP Engine Headless integration

## Recent Changes and Decisions

### Navigation Structure Decision
**Decision**: Reorganized navigation to prioritize user journey
- **Rationale**: Getting Started should be the primary entry point for new users
- **Impact**: Improved user experience, clearer information architecture
- **Implementation**: Updated `astro.config.mjs` sidebar configuration

### Content Marker System Design
**Decision**: Implemented comprehensive content marking system
- **Rationale**: Clear boundaries between auto-generated and human content
- **Impact**: Enables safe automation while preserving human expertise
- **Implementation**: Defined in `.clinerules` with specific marker patterns

### Memory Bank Organization
**Decision**: Separated concerns across multiple memory bank files
- **Rationale**: Better organization and easier maintenance of project knowledge
- **Impact**: Clearer context for future development and onboarding
- **Implementation**: Created focused files for different aspects of the project

## Next Steps (Immediate Priority)

### 1. Create Project Structure
```bash
# Create directories for scripts and templates
mkdir -p scripts/utils
mkdir -p templates/base
mkdir -p templates/components
mkdir -p templates/partials
```

### 2. Install Required Dependencies
```bash
npm install --save-dev js-yaml handlebars fs-extra chalk glob markdown-it prettier
```

### 3. Implement OpenAPI Parser
- Create `scripts/parse-openapi.js`
- Extract endpoint data from `public/openapi/v1.yaml`
- Generate structured JSON for template processing
- Validate OpenAPI spec compliance

### 4. Create Template System
- Design base templates for endpoints and sections
- Implement variable injection system
- Create reusable components for parameters, responses, etc.
- Test template rendering with sample data

### 5. Build Documentation Generator
- Create `scripts/generate-docs.js`
- Implement file generation logic
- Add content marker insertion
- Test with subset of endpoints

## Active Decisions and Considerations

### Code Example Language Priority
**Current Decision**: cURL, PHP, Python, Node.js (JavaScript same as Node.js)
- **Consideration**: Should we add more languages (Go, Ruby, .NET)?
- **Status**: Sticking with current four for initial implementation
- **Review Date**: After initial system is working

### Template Engine Choice
**Current Decision**: Handlebars for template processing
- **Consideration**: Handlebars vs Mustache vs custom solution
- **Rationale**: Handlebars provides good balance of power and simplicity
- **Status**: Proceeding with Handlebars

### File Organization Strategy
**Current Decision**: Organize generated files by OpenAPI tags
- **Structure**: `api-reference/endpoints/{tag}/{operation-id}.mdx`
- **Consideration**: Flat vs nested structure for discoverability
- **Status**: Testing nested structure first

### Content Preservation Approach
**Current Decision**: Section-level markers with diff-based updates
- **Approach**: Preserve custom sections, regenerate marked sections
- **Consideration**: File-level vs section-level granularity
- **Status**: Implementing section-level for maximum flexibility

## Important Patterns and Preferences

### File Naming Conventions
```javascript
// Endpoint files
const endpointFileName = (method, path, operationId) => {
  // Use operationId if available, otherwise generate from method + path
  return operationId ? 
    `${kebabCase(operationId)}.mdx` : 
    `${method.toLowerCase()}-${pathToSlug(path)}.mdx`;
};

// Section index files
const sectionFileName = (tag) => `${kebabCase(tag)}/index.mdx`;
```

### Content Marker Patterns
```markdown
<!-- AUTO-GENERATED: Do not edit directly -->
<!-- Source: public/openapi/v1.yaml -->
<!-- Last updated: 2025-01-27T09:53:00Z -->
<!-- Generator: scripts/generate-docs.js v1.0.0 -->

<!-- AUTO-GENERATED-START: endpoint-summary -->
[Generated content]
<!-- AUTO-GENERATED-END: endpoint-summary -->

<!-- CUSTOM-START: additional-examples -->
[Human content preserved during regeneration]
<!-- CUSTOM-END: additional-examples -->
```

### Error Handling Strategy
```javascript
const errorHandling = {
  // Continue processing other endpoints if one fails
  parseErrors: 'log-and-continue',
  
  // Stop build if templates are broken
  templateErrors: 'log-and-fail',
  
  // Stop build if validation fails
  validationErrors: 'log-and-fail',
  
  // Provide detailed error context
  errorReporting: 'detailed-with-context'
};
```

## Learnings and Project Insights

### OpenAPI Spec Characteristics
- **Version**: Swagger 2.0 (older format, but well-structured)
- **Completeness**: Comprehensive coverage of all endpoints
- **Quality**: Good parameter documentation and examples
- **Consistency**: Consistent patterns across endpoints
- **Opportunity**: Could benefit from more detailed descriptions

### Astro/Starlight Integration Points
- **Component System**: Rich component library for documentation
- **MDX Support**: Excellent for mixing markdown with interactive elements
- **Build Performance**: Fast builds suitable for frequent regeneration
- **Customization**: Good balance of convention and customization

### WP Engine API Patterns
- **Authentication**: Consistent Basic Auth across all endpoints
- **Pagination**: Standard limit/offset pattern
- **Error Handling**: Well-defined error response structure
- **Rate Limiting**: Built-in with clear error messages
- **Resource Hierarchy**: Clear parent-child relationships (accounts > sites > installs)

## Monitoring and Success Criteria

### Implementation Milestones
1. **Parser Working**: Successfully extract all endpoint data
2. **Templates Rendering**: Generate valid MDX for sample endpoints
3. **Full Generation**: Complete documentation for all endpoints
4. **Navigation Updated**: Automatic navigation generation working
5. **Validation Passing**: All generated content passes quality checks

### Quality Gates
- [ ] All OpenAPI endpoints have corresponding documentation files
- [ ] All generated MDX files pass syntax validation
- [ ] All code examples are syntactically correct
- [ ] All internal links resolve correctly
- [ ] Build time remains under 2 minutes
- [ ] Generated content matches established style guide

### Success Metrics
- **Coverage**: 100% of API endpoints documented
- **Accuracy**: 0 broken examples in generated content
- **Performance**: < 2 minute full regeneration time
- **Maintainability**: Human can easily add custom content
- **Automation**: Updates triggered automatically from spec changes

## Risk Mitigation

### Technical Risks
- **OpenAPI Parsing**: Complex spec structure could cause parsing issues
  - *Mitigation*: Comprehensive error handling and validation
- **Template Complexity**: Complex templates could be hard to maintain
  - *Mitigation*: Start simple, add complexity incrementally
- **Content Conflicts**: Human edits could conflict with generation
  - *Mitigation*: Clear marker system and conflict detection

### Process Risks
- **Review Bottlenecks**: Manual review could slow down updates
  - *Mitigation*: Automated validation to catch issues early
- **External Dependencies**: External OpenAPI spec changes could break builds
  - *Mitigation*: Robust error handling and rollback procedures
- **Knowledge Transfer**: Complex system could be hard for others to maintain
  - *Mitigation*: Comprehensive documentation and clear patterns
