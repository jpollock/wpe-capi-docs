#!/usr/bin/env node

import fs from 'fs-extra';
import yaml from 'js-yaml';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResponseExampleGenerator } from './utils/response-examples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * OpenAPI Parser for WP Engine Customer API Documentation
 * 
 * Extracts structured data from OpenAPI specification for documentation generation.
 * Follows the patterns defined in .clinerules and memory-bank documentation.
 */

class OpenAPIParser {
  constructor(specPath) {
    this.specPath = specPath;
    this.spec = null;
    this.endpoints = [];
    this.tags = new Map();
    this.schemas = new Map();
    this.responseGenerator = null;
  }

  /**
   * Parse the OpenAPI specification file
   */
  async parseSpec() {
    try {
      console.log(chalk.blue('📖 Parsing OpenAPI specification...'));
      
      const specContent = await fs.readFile(this.specPath, 'utf8');
      this.spec = yaml.load(specContent);
      
      console.log(chalk.green(`✅ Loaded OpenAPI spec: ${this.spec.info.title} v${this.spec.info.version}`));
      
      this.validateSpec();
      this.extractSchemas();
      this.responseGenerator = new ResponseExampleGenerator(this.spec);
      this.extractEndpoints();
      this.organizeByTags();
      
      return this.getStructuredData();
    } catch (error) {
      console.error(chalk.red('❌ Error parsing OpenAPI spec:'), error.message);
      throw error;
    }
  }

  /**
   * Validate the OpenAPI specification
   */
  validateSpec() {
    if (!this.spec.swagger && !this.spec.openapi) {
      throw new Error('Invalid OpenAPI specification: missing version field');
    }
    
    if (!this.spec.paths) {
      throw new Error('Invalid OpenAPI specification: missing paths');
    }
    
    console.log(chalk.green('✅ OpenAPI specification is valid'));
  }

  /**
   * Extract all endpoints from the specification
   */
  extractEndpoints() {
    console.log(chalk.blue('🔍 Extracting endpoints...'));
    
    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
          const endpoint = this.processEndpoint(path, method, operation);
          this.endpoints.push(endpoint);
        }
      }
    }
    
    console.log(chalk.green(`✅ Extracted ${this.endpoints.length} endpoints`));
  }

  /**
   * Process a single endpoint
   */
  processEndpoint(path, method, operation) {
    const parameters = operation.parameters || [];
    
    const endpoint = {
      path,
      method: method.toUpperCase(),
      operationId: operation.operationId,
      summary: operation.summary || '',
      description: operation.description || '',
      tags: operation.tags || ['untagged'],
      parameters: this.processParameters(parameters),
      requestBody: this.processRequestBody(operation.requestBody, parameters),
      security: operation.security || this.spec.security || [],
      deprecated: operation.deprecated || false,
      examples: this.extractExamples(operation)
    };

    // Generate slug for file naming
    endpoint.slug = this.generateSlug(endpoint);
    
    // Generate display name
    endpoint.displayName = this.generateDisplayName(endpoint);
    
    // Process responses after endpoint is constructed
    endpoint.responses = this.processResponses(operation.responses || {}, endpoint);
    
    return endpoint;
  }

  /**
   * Process endpoint parameters
   */
  processParameters(parameters) {
    const processed = {
      path: [],
      query: [],
      header: [],
      formData: []
    };

    parameters.forEach(param => {
      const processedParam = {
        name: param.name,
        type: param.type || 'string',
        format: param.format,
        required: param.required || false,
        description: param.description || '',
        example: param['x-example'] || param.example,
        enum: param.enum,
        default: param.default
      };

      if (param.in && processed[param.in]) {
        processed[param.in].push(processedParam);
      }
    });

    return processed;
  }

  /**
   * Process request body (for OpenAPI 3.0, adapt for Swagger 2.0)
   */
  processRequestBody(requestBody, parameters = []) {
    // Handle OpenAPI 3.0 style request body
    if (requestBody && typeof requestBody === 'object' && requestBody.schema) {
      return {
        required: requestBody.required || false,
        description: requestBody.description || '',
        schema: requestBody.schema,
        properties: this.processRequestBodyProperties(requestBody.schema),
        examples: this.extractBodyExamples(requestBody),
        example: this.generateRequestBodyExample(requestBody.schema)
      };
    }

    // Handle Swagger 2.0 style (parameters with in: body)
    const bodyParam = parameters.find(param => param.in === 'body');
    if (bodyParam) {
      return {
        required: bodyParam.required || false,
        description: bodyParam.description || '',
        schema: bodyParam.schema,
        properties: this.processRequestBodyProperties(bodyParam.schema),
        examples: this.extractBodyExamples(bodyParam),
        example: this.generateRequestBodyExample(bodyParam.schema)
      };
    }

    return null;
  }

  /**
   * Process request body properties into flat structure with dot notation
   */
  processRequestBodyProperties(schema, parentKey = '', parentRequired = []) {
    if (!schema || !schema.properties) {
      return [];
    }

    const properties = [];
    const required = schema.required || parentRequired;

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const fullName = parentKey ? `${parentKey}.${propName}` : propName;
      const isRequired = required.includes(propName);

      const property = {
        name: fullName,
        required: isRequired,
        description: propSchema.description || '',
        type: propSchema.type || 'string',
        format: propSchema.format,
        enum: propSchema.enum
      };

      properties.push(property);

      // Handle nested object properties recursively
      if (propSchema.type === 'object' && propSchema.properties) {
        const nestedRequired = propSchema.required || [];
        const nestedProperties = this.processRequestBodyProperties(
          propSchema, 
          fullName, 
          nestedRequired
        );
        properties.push(...nestedProperties);
      }
    }

    return properties;
  }

  /**
   * Process response definitions
   */
  processResponses(responses, endpoint) {
    const processed = {};

    for (const [statusCode, response] of Object.entries(responses)) {
      const processedResponse = {
        description: response.description || '',
        schema: response.schema,
        examples: response.examples || {},
        headers: response.headers || {},
        jsonExample: null
      };

      // Generate JSON example from schema or contextual error
      if (this.responseGenerator) {
        try {
          let example = null;
          
          // For error responses (4xx, 5xx), use contextual examples
          if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
            example = this.responseGenerator.generateContextualErrorExample(
              statusCode, 
              endpoint.path, 
              endpoint.method
            );
          } else if (response.schema) {
            // For success responses, use schema-based generation
            example = this.responseGenerator.generateResponseExample(response);
          }
          
          if (example) {
            processedResponse.jsonExample = example;
          }
        } catch (error) {
          console.warn(`Warning: Could not generate example for ${statusCode} response:`, error.message);
        }
      }

      processed[statusCode] = processedResponse;
    }

    return processed;
  }

  /**
   * Extract code examples from operation
   */
  extractExamples(operation) {
    const examples = {
      curl: null,
      php: null,
      python: null,
      nodejs: null
    };

    // Extract examples from x-code-samples if present
    if (operation['x-code-samples']) {
      operation['x-code-samples'].forEach(sample => {
        const lang = sample.lang?.toLowerCase();
        if (examples.hasOwnProperty(lang)) {
          examples[lang] = sample.source;
        }
      });
    }

    return examples;
  }

  /**
   * Extract body examples
   */
  extractBodyExamples(requestBody) {
    const examples = {};
    
    if (requestBody.examples) {
      return requestBody.examples;
    }
    
    if (requestBody.example) {
      examples.default = requestBody.example;
    }
    
    return examples;
  }

  /**
   * Generate request body example from schema
   */
  generateRequestBodyExample(schema) {
    if (!schema) return null;

    try {
      return this.generateExampleFromSchema(schema);
    } catch (error) {
      console.warn('Could not generate request body example:', error.message);
      return null;
    }
  }

  /**
   * Generate example data from schema
   */
  generateExampleFromSchema(schema) {
    if (!schema) return null;

    if (schema.example !== undefined) {
      return schema.example;
    }

    if (schema.type === 'object' && schema.properties) {
      const example = {};
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.example !== undefined) {
          example[propName] = propSchema.example;
        } else if (propSchema.type === 'string') {
          example[propName] = propSchema.example || `example-${propName}`;
        } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
          example[propName] = propSchema.example || 123;
        } else if (propSchema.type === 'boolean') {
          example[propName] = propSchema.example || true;
        } else if (propSchema.type === 'array') {
          example[propName] = propSchema.example || [this.generateExampleFromSchema(propSchema.items)];
        } else if (propSchema.type === 'object') {
          example[propName] = this.generateExampleFromSchema(propSchema);
        }
      }
      return example;
    }

    if (schema.type === 'array' && schema.items) {
      return [this.generateExampleFromSchema(schema.items)];
    }

    return null;
  }

  /**
   * Extract schema definitions
   */
  extractSchemas() {
    if (this.spec.definitions) {
      for (const [name, schema] of Object.entries(this.spec.definitions)) {
        this.schemas.set(name, schema);
      }
    }
    
    if (this.spec.components?.schemas) {
      for (const [name, schema] of Object.entries(this.spec.components.schemas)) {
        this.schemas.set(name, schema);
      }
    }
    
    console.log(chalk.green(`✅ Extracted ${this.schemas.size} schema definitions`));
  }

  /**
   * Organize endpoints by tags
   */
  organizeByTags() {
    console.log(chalk.blue('🏷️  Organizing endpoints by tags...'));
    
    this.endpoints.forEach(endpoint => {
      endpoint.tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, {
            name: tag,
            displayName: this.formatTagName(tag),
            description: this.getTagDescription(tag),
            endpoints: []
          });
        }
        this.tags.get(tag).endpoints.push(endpoint);
      });
    });
    
    console.log(chalk.green(`✅ Organized into ${this.tags.size} tag groups`));
  }

  /**
   * Get tag description from spec
   */
  getTagDescription(tagName) {
    if (this.spec.tags) {
      const tag = this.spec.tags.find(t => t.name === tagName);
      return tag?.description || '';
    }
    return '';
  }

  /**
   * Format tag name for display
   */
  formatTagName(tag) {
    return tag
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate URL slug for endpoint
   */
  generateSlug(endpoint) {
    if (endpoint.operationId) {
      return this.kebabCase(endpoint.operationId);
    }
    
    // Generate from method and path
    const pathSlug = endpoint.path
      .replace(/[{}]/g, '')
      .replace(/\//g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `${endpoint.method.toLowerCase()}-${pathSlug}`;
  }

  /**
   * Generate display name for endpoint
   */
  generateDisplayName(endpoint) {
    if (endpoint.summary) {
      return endpoint.summary;
    }
    
    if (endpoint.operationId) {
      return this.titleCase(endpoint.operationId);
    }
    
    return `${endpoint.method} ${endpoint.path}`;
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
   * Get structured data for template processing
   */
  getStructuredData() {
    return {
      spec: {
        title: this.spec.info.title,
        version: this.spec.info.version,
        description: this.spec.info.description,
        host: this.spec.host,
        basePath: this.spec.basePath,
        schemes: this.spec.schemes
      },
      endpoints: this.endpoints,
      tags: Array.from(this.tags.values()),
      schemas: Object.fromEntries(this.schemas),
      stats: {
        totalEndpoints: this.endpoints.length,
        totalTags: this.tags.size,
        totalSchemas: this.schemas.size
      }
    };
  }

  /**
   * Save parsed data to JSON file
   */
  async saveToFile(outputPath) {
    const data = this.getStructuredData();
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, data, { spaces: 2 });
    console.log(chalk.green(`✅ Saved parsed data to ${outputPath}`));
    return data;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const specPath = path.resolve(__dirname, '../public/openapi/v1.yaml');
    const outputPath = path.resolve(__dirname, '../.temp/parsed-openapi.json');
    
    console.log(chalk.bold.blue('🚀 WP Engine API Documentation Parser\n'));
    
    const parser = new OpenAPIParser(specPath);
    const data = await parser.parseSpec();
    await parser.saveToFile(outputPath);
    
    console.log(chalk.bold.green('\n✨ Parsing completed successfully!'));
    console.log(chalk.gray(`📊 Statistics:`));
    console.log(chalk.gray(`   • ${data.stats.totalEndpoints} endpoints`));
    console.log(chalk.gray(`   • ${data.stats.totalTags} tag groups`));
    console.log(chalk.gray(`   • ${data.stats.totalSchemas} schemas`));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Parsing failed:'), error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OpenAPIParser };
