#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { OpenAPIParser } from './parse-openapi.js';
import { CodeExampleGenerator } from './utils/code-examples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main Documentation Generator for WP Engine Customer API
 * 
 * Orchestrates the complete documentation generation process:
 * 1. Parse OpenAPI specification
 * 2. Generate code examples
 * 3. Process templates
 * 4. Create MDX files with proper content markers
 * 5. Update navigation structure
 */

class DocumentationGenerator {
  constructor(options = {}) {
    this.options = {
      specPath: path.resolve(__dirname, '../public/openapi/v1.yaml'),
      outputDir: path.resolve(__dirname, '../src/content/docs/api-reference/endpoints'),
      templatesDir: path.resolve(__dirname, '../templates'),
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.parser = null;
    this.codeGenerator = null;
    this.data = null;
    this.stats = {
      endpointsGenerated: 0,
      sectionsCreated: 0,
      filesWritten: 0,
      errors: []
    };
  }

  /**
   * Main generation process
   */
  async generate() {
    try {
      console.log(chalk.bold.blue('🚀 WP Engine API Documentation Generator\n'));
      
      await this.parseOpenAPI();
      await this.setupTemplates();
      await this.generateEndpointDocumentation();
      await this.generateSectionIndexes();
      await this.generateMainIndex();
      await this.generateAllEndpointsPage();
      await this.updateNavigation();
      
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.red('❌ Generation failed:'), error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Parse OpenAPI specification
   */
  async parseOpenAPI() {
    this.log('📖 Parsing OpenAPI specification...');
    
    this.parser = new OpenAPIParser(this.options.specPath);
    this.data = await this.parser.parseSpec();
    this.codeGenerator = new CodeExampleGenerator(this.data.spec);
    
    this.log(`✅ Parsed ${this.data.stats.totalEndpoints} endpoints in ${this.data.stats.totalTags} sections`);
  }

  /**
   * Setup Handlebars templates
   */
  async setupTemplates() {
    this.log('🔧 Setting up templates...');
    
    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
    
    // Load templates
    this.templates = {
      endpoint: await this.loadTemplate('base/endpoint.mdx'),
      sectionIndex: await this.loadTemplate('base/section-index.mdx'),
      mainIndex: await this.loadTemplate('base/main-index.mdx'),
      allEndpoints: await this.loadTemplate('base/all-endpoints.mdx')
    };
    
    this.log('✅ Templates loaded and configured');
  }

  /**
   * Generate documentation for all endpoints
   */
  async generateEndpointDocumentation() {
    this.log('📝 Generating endpoint documentation...');
    
    for (const endpoint of this.data.endpoints) {
      try {
        await this.generateEndpointDoc(endpoint);
        this.stats.endpointsGenerated++;
      } catch (error) {
        this.stats.errors.push({
          type: 'endpoint',
          endpoint: `${endpoint.method} ${endpoint.path}`,
          error: error.message
        });
        console.warn(chalk.yellow(`⚠️  Failed to generate ${endpoint.method} ${endpoint.path}: ${error.message}`));
      }
    }
    
    this.log(`✅ Generated ${this.stats.endpointsGenerated} endpoint documents`);
  }

  /**
   * Generate documentation for a single endpoint
   */
  async generateEndpointDoc(endpoint) {
    // Generate code examples
    const examples = this.codeGenerator.generateExamples(endpoint);
    
    // Prepare template data
    const templateData = {
      endpoint: {
        ...endpoint,
        examples,
        tagDisplayNames: this.getTagDisplayNames(),
        tagSlugs: this.getTagSlugs()
      },
      spec: this.data.spec,
      timestamp: new Date().toISOString(),
      generator: 'scripts/generate-docs.js v1.0.0',
      tagDisplayNames: this.getTagDisplayNames(),
      tagSlugs: this.getTagSlugs()
    };
    
    // Generate content
    const content = this.templates.endpoint(templateData);
    
    // Determine file path
    const tag = endpoint.tags[0] || 'untagged';
    const fileName = `${endpoint.slug}.mdx`;
    const filePath = path.join(this.options.outputDir, this.kebabCase(tag), fileName);
    
    // Write file
    await this.writeFile(filePath, content);
    this.stats.filesWritten++;
    
    this.verbose(`Generated: ${path.relative(process.cwd(), filePath)}`);
  }

  /**
   * Generate section index pages
   */
  async generateSectionIndexes() {
    this.log('📑 Generating section indexes...');
    
    for (const tag of this.data.tags) {
      try {
        await this.generateSectionIndex(tag);
        this.stats.sectionsCreated++;
      } catch (error) {
        this.stats.errors.push({
          type: 'section',
          section: tag.name,
          error: error.message
        });
        console.warn(chalk.yellow(`⚠️  Failed to generate section ${tag.name}: ${error.message}`));
      }
    }
    
    this.log(`✅ Generated ${this.stats.sectionsCreated} section indexes`);
  }

  /**
   * Generate index page for a section
   */
  async generateSectionIndex(tag) {
    const templateData = {
      tag,
      spec: this.data.spec,
      timestamp: new Date().toISOString(),
      generator: 'scripts/generate-docs.js v1.0.0'
    };
    
    const content = this.templates.sectionIndex(templateData);
    const filePath = path.join(this.options.outputDir, this.kebabCase(tag.name), 'index.mdx');
    
    await this.writeFile(filePath, content);
    this.stats.filesWritten++;
    
    this.verbose(`Generated: ${path.relative(process.cwd(), filePath)}`);
  }

  /**
   * Generate main endpoints index (comprehensive single page)
   */
  async generateMainIndex() {
    this.log('📋 Generating comprehensive main endpoints index...');
    
    // Prepare tags with enhanced endpoint data including examples
    const tagsWithExamples = this.data.tags.map(tag => ({
      ...tag,
      endpoints: tag.endpoints.map(endpoint => ({
        ...endpoint,
        examples: this.codeGenerator.generateExamples(endpoint)
      }))
    }));
    
    const templateData = {
      tags: tagsWithExamples,
      spec: this.data.spec,
      stats: this.data.stats,
      timestamp: new Date().toISOString(),
      generator: 'scripts/generate-docs.js v1.0.0'
    };
    
    const content = this.templates.allEndpoints(templateData);
    const filePath = path.join(this.options.outputDir, 'index.mdx');
    
    await this.writeFile(filePath, content);
    this.stats.filesWritten++;
    
    this.log('✅ Generated comprehensive main endpoints index');
  }

  /**
   * Generate comprehensive all-endpoints page
   */
  async generateAllEndpointsPage() {
    this.log('📄 Generating comprehensive endpoints page...');
    
    // Prepare tags with enhanced endpoint data including examples
    const tagsWithExamples = this.data.tags.map(tag => ({
      ...tag,
      endpoints: tag.endpoints.map(endpoint => ({
        ...endpoint,
        examples: this.codeGenerator.generateExamples(endpoint)
      }))
    }));
    
    const templateData = {
      tags: tagsWithExamples,
      spec: this.data.spec,
      stats: this.data.stats,
      timestamp: new Date().toISOString(),
      generator: 'scripts/generate-docs.js v1.0.0'
    };
    
    const content = this.templates.allEndpoints(templateData);
    const filePath = path.join(this.options.outputDir, 'all.mdx');
    
    await this.writeFile(filePath, content);
    this.stats.filesWritten++;
    
    this.log('✅ Generated comprehensive endpoints page');
  }

  /**
   * Update navigation configuration
   */
  async updateNavigation() {
    this.log('🧭 Skipping navigation update (manual sidebar configuration)...');
    this.log('💡 Navigation is manually configured in astro.config.mjs');
    this.log('💡 To update navigation, run: npm run update-nav');
  }

  /**
   * Load a Handlebars template
   */
  async loadTemplate(templatePath) {
    const fullPath = path.join(this.options.templatesDir, templatePath);
    const templateContent = await fs.readFile(fullPath, 'utf8');
    return handlebars.compile(templateContent);
  }

  /**
   * Register Handlebars helpers
   */
  registerHandlebarsHelpers() {
    // Helper for conditional equality
    handlebars.registerHelper('eq', (a, b) => a === b);
    
    // Helper for conditional inequality
    handlebars.registerHelper('ne', (a, b) => a !== b);
    
    // Helper for greater than
    handlebars.registerHelper('gt', (a, b) => a > b);
    
    // Helper for less than
    handlebars.registerHelper('lt', (a, b) => a < b);
    
    // Helper for logical OR
    handlebars.registerHelper('or', (a, b) => a || b);
    
    // Helper for logical AND
    handlebars.registerHelper('and', (a, b) => a && b);
    
    // Helper for array length check
    handlebars.registerHelper('hasItems', (array) => Array.isArray(array) && array.length > 0);
    
    // Helper for JSON formatting
    handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));
    
    // Helper for raw JSON formatting (no HTML escaping)
    handlebars.registerHelper('rawJson', (obj) => {
      if (obj === null || obj === undefined) {
        return new handlebars.SafeString('null');
      }
      
      if (typeof obj === 'string') {
        // If it's already a string, return as-is
        return new handlebars.SafeString(obj);
      }
      
      try {
        const jsonString = JSON.stringify(obj, null, 2);
        return new handlebars.SafeString(jsonString);
      } catch (error) {
        return new handlebars.SafeString('{"error": "Failed to serialize JSON"}');
      }
    });
    
    // Helper for kebab-case conversion
    handlebars.registerHelper('kebabCase', (str) => this.kebabCase(str));
    
    // Helper for title case conversion
    handlebars.registerHelper('titleCase', (str) => this.titleCase(str));
    
    // Helper for formatting HTTP status codes
    handlebars.registerHelper('formatStatus', (status) => {
      const statusMap = {
        '200': '200 OK',
        '201': '201 Created',
        '202': '202 Accepted',
        '204': '204 No Content',
        '400': '400 Bad Request',
        '401': '401 Unauthorized',
        '403': '403 Forbidden',
        '404': '404 Not Found',
        '429': '429 Too Many Requests',
        '500': '500 Internal Server Error',
        '503': '503 Service Unavailable'
      };
      return statusMap[status] || `${status}`;
    });
    
    // Helper for escaping curly braces in paths for MDX
    handlebars.registerHelper('escapePath', (path) => {
      return path.replace(/{/g, '\\{').replace(/}/g, '\\}');
    });
  }

  /**
   * Write file with proper directory creation
   */
  async writeFile(filePath, content) {
    if (this.options.dryRun) {
      this.verbose(`[DRY RUN] Would write: ${path.relative(process.cwd(), filePath)}`);
      return;
    }
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * Get tag display names mapping
   */
  getTagDisplayNames() {
    const mapping = {};
    this.data.tags.forEach(tag => {
      mapping[tag.name] = tag.displayName || tag.name;
    });
    return mapping;
  }

  /**
   * Get tag slugs mapping
   */
  getTagSlugs() {
    const mapping = {};
    this.data.tags.forEach(tag => {
      mapping[tag.name] = this.kebabCase(tag.name);
    });
    return mapping;
  }

  /**
   * Convert string to kebab-case
   */
  kebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to Title Case
   */
  titleCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Log message if verbose mode is enabled
   */
  verbose(message) {
    if (this.options.verbose) {
      console.log(chalk.gray(`  ${message}`));
    }
  }

  /**
   * Log message
   */
  log(message) {
    console.log(message);
  }

  /**
   * Print generation summary
   */
  printSummary() {
    console.log(chalk.bold.green('\n✨ Documentation generation completed!'));
    console.log(chalk.gray('📊 Summary:'));
    console.log(chalk.gray(`   • ${this.stats.endpointsGenerated} endpoints documented`));
    console.log(chalk.gray(`   • ${this.stats.sectionsCreated} sections created`));
    console.log(chalk.gray(`   • ${this.stats.filesWritten} files written`));
    
    if (this.stats.errors.length > 0) {
      console.log(chalk.yellow(`   • ${this.stats.errors.length} errors encountered`));
      
      if (this.options.verbose) {
        console.log(chalk.yellow('\n⚠️  Errors:'));
        this.stats.errors.forEach(error => {
          console.log(chalk.yellow(`   • ${error.type}: ${error.endpoint || error.section} - ${error.error}`));
        });
      }
    }
    
    if (this.options.dryRun) {
      console.log(chalk.blue('\n🔍 This was a dry run. No files were actually written.'));
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
  
  const generator = new DocumentationGenerator(options);
  await generator.generate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { DocumentationGenerator };
