# Technical Context - WP Engine Customer API Documentation

## Technology Stack

### Core Framework
- **Astro 5.3.1**: Static site generator with MDX support
- **Starlight**: Astro integration for documentation sites
- **Node.js**: Runtime environment for build scripts
- **TypeScript**: Type safety for configuration and scripts

### Content Management
- **MDX**: Markdown with JSX components for rich documentation
- **YAML**: OpenAPI specification format
- **JSON**: Configuration and data exchange format

### Styling & UI
- **CSS Custom Properties**: Theme customization
- **Starlight Components**: Built-in documentation components (Tabs, Cards, etc.)
- **Responsive Design**: Mobile-first approach

### Development Tools
- **npm**: Package management and script execution
- **Git**: Version control and collaboration
- **ESLint/Prettier**: Code formatting and linting (when configured)

## OpenAPI Specification Structure

### Current Spec Analysis
```yaml
# public/openapi/v1.yaml
swagger: '2.0'
info:
  version: 1.6.7
  title: WP Engine API
host: api.wpengineapi.com
basePath: /v1
schemes: [https]
```

### Endpoint Organization by Tags
- **status**: API health and swagger endpoints
- **account**: Account management operations
- **account_user**: User management within accounts
- **site**: Site management operations
- **install**: WordPress installation management
- **domain**: Domain and redirect management
- **backup**: Backup creation and monitoring
- **cache**: Cache purging operations
- **user**: Current user information
- **ssh_key**: SSH key management

### Authentication Pattern
```yaml
securityDefinitions:
  basicAuth:
    type: basic
    description: API username and password from Portal's API Access page
```

### Common Patterns
- **Pagination**: limit/offset parameters for list endpoints
- **UUID Identifiers**: All resources use UUID format
- **Consistent Error Responses**: Standardized error structure
- **Rate Limiting**: Built-in rate limiting with specific error responses

## Development Environment

### Local Development
```bash
# Development server
npm run dev          # Starts Astro dev server on localhost:4321+

# Build process
npm run build        # Generates static site in dist/
npm run preview      # Preview built site locally
```

### File Structure
```
/Users/jeremy.pollock/development/wpengine/customer_api/docs/wpe-capi-docs/
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .clinerules             # Project-specific rules
├── memory-bank/            # Project documentation
├── public/                 # Static assets
│   └── openapi/v1.yaml    # OpenAPI specification
├── src/
│   ├── content/           # Documentation content
│   ├── components/        # Astro components
│   ├── assets/           # Images and media
│   └── styles/           # CSS customizations
└── scripts/              # Build and generation scripts (to be created)
```

## WP Engine Headless Integration

### Deployment Platform
- **WP Engine Headless**: Static site hosting with CDN
- **GitHub Integration**: Automatic deployments from repository
- **Ephemeral Environments**: Branch-based preview deployments
- **Custom Domains**: Production and staging domain support

### Build Requirements
- **Node.js Environment**: Compatible with WP Engine's build system
- **Static Output**: Generated files served via CDN
- **Asset Optimization**: Images and CSS optimized for performance
- **Build Time**: Reasonable build times for CI/CD pipeline

### Environment Variables
```bash
# Production
SITE_URL=https://docs.wpengine.com
ENVIRONMENT=production

# Staging
SITE_URL=https://staging-docs.wpengine.com
ENVIRONMENT=staging

# Preview (dynamic)
SITE_URL=https://preview-{branch}.wpengine.com
ENVIRONMENT=preview
```

## GitHub Actions Requirements

### Workflow Triggers
- **Push to main**: Production deployment
- **Push to develop**: Staging deployment
- **Pull Request**: Preview environment creation
- **External Webhook**: OpenAPI spec updates from external repository

### Build Pipeline
```yaml
# Proposed workflow structure
name: Build and Deploy Documentation
on:
  push: [main, develop]
  pull_request: [main, develop]
  repository_dispatch: [openapi-update]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - install-dependencies
      - generate-docs        # Custom script
      - validate-content     # Custom script
      - build-site
      - deploy-to-wpengine
```

### External Repository Monitoring
- **Source Repository**: Separate repo containing OpenAPI spec
- **Webhook Integration**: Automatic notifications of spec changes
- **PR Creation**: Automated pull requests for spec updates
- **Change Detection**: Only trigger builds when spec actually changes

## Dependencies & Constraints

### Current Dependencies
```json
{
  "@astrojs/node": "^9.1.1",
  "@astrojs/starlight": "^0.32.1", 
  "astro": "^5.1.5",
  "sharp": "^0.32.5"
}
```

### Additional Dependencies Needed
```json
{
  "js-yaml": "^4.1.0",           # YAML parsing
  "handlebars": "^4.7.8",        # Template processing
  "fs-extra": "^11.2.0",         # File system utilities
  "chalk": "^5.3.0",             # Console output formatting
  "glob": "^10.3.10",            # File pattern matching
  "markdown-it": "^14.0.0",      # Markdown processing
  "prettier": "^3.2.5"           # Code formatting
}
```

### Performance Constraints
- **Build Time**: Target < 2 minutes for full regeneration
- **File Size**: Individual pages < 500KB for fast loading
- **Memory Usage**: Build process < 1GB RAM usage
- **Concurrent Builds**: Support multiple preview environments

## Code Example Generation

### Language Support
```javascript
const supportedLanguages = {
  curl: {
    extension: 'bash',
    template: 'curl-template.hbs',
    validator: 'validate-bash'
  },
  php: {
    extension: 'php', 
    template: 'php-template.hbs',
    validator: 'validate-php'
  },
  python: {
    extension: 'py',
    template: 'python-template.hbs', 
    validator: 'validate-python'
  },
  nodejs: {
    extension: 'js',
    template: 'nodejs-template.hbs',
    validator: 'validate-javascript'
  }
};
```

### Authentication Handling
```javascript
// Consistent auth patterns across languages
const authenticationPatterns = {
  basic: {
    curl: '-u "API_USER_ID:API_USER_PASSWORD"',
    php: 'base64_encode("API_USER_ID:API_USER_PASSWORD")',
    python: 'base64.b64encode("API_USER_ID:API_USER_PASSWORD".encode()).decode()',
    nodejs: 'Buffer.from("API_USER_ID:API_USER_PASSWORD").toString("base64")'
  }
};
```

## Content Validation

### MDX Validation
- **Syntax Checking**: Valid MDX/Markdown syntax
- **Component Usage**: Proper Starlight component usage
- **Link Validation**: Internal and external link checking
- **Image Optimization**: Proper image formats and sizes

### OpenAPI Compliance
- **Spec Validation**: Valid OpenAPI 2.0/3.0 format
- **Endpoint Coverage**: All endpoints documented
- **Parameter Accuracy**: Correct parameter types and requirements
- **Response Validation**: Accurate response schemas

### Code Example Validation
```javascript
const validationRules = {
  curl: validateBashSyntax,
  php: validatePHPSyntax,
  python: validatePythonSyntax,
  nodejs: validateJavaScriptSyntax
};
```

## Security Considerations

### Content Security
- **Input Sanitization**: Sanitize OpenAPI spec content
- **XSS Prevention**: Escape user-provided content
- **Safe Templating**: Prevent template injection attacks

### Build Security
- **Dependency Scanning**: Regular security audits of npm packages
- **Secret Management**: Secure handling of API keys and tokens
- **Access Control**: Restricted access to build and deployment systems

## Monitoring & Observability

### Build Monitoring
- **Build Success Rate**: Track successful vs failed builds
- **Build Duration**: Monitor build performance over time
- **Error Tracking**: Categorize and track build errors
- **Resource Usage**: Monitor memory and CPU usage during builds

### Content Quality Metrics
- **Coverage**: Percentage of API endpoints documented
- **Freshness**: Time since last update for each endpoint
- **Accuracy**: Validation results for code examples
- **User Feedback**: Documentation quality ratings and comments

## Backup & Recovery

### Content Backup
- **Git History**: Full version control of all content
- **Generated Content**: Backup of generated files for rollback
- **Configuration Backup**: Backup of build scripts and templates

### Recovery Procedures
- **Rollback Strategy**: Quick rollback to previous working version
- **Rebuild Process**: Full regeneration from OpenAPI spec
- **Emergency Procedures**: Manual content updates when automation fails
