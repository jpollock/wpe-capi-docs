#!/usr/bin/env node

/**
 * OpenAPI Change Detection Script
 * 
 * Compares two OpenAPI specifications and detects changes
 * Outputs results to temporary files for GitHub Actions consumption
 */

import fs from 'fs';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OpenAPIChangeDetector {
  constructor() {
    this.changes = {
      endpoints: { added: [], removed: [], modified: [] },
      schemas: { added: [], removed: [], modified: [] },
      breaking: [],
      metadata: {}
    };
  }

  async detectChanges(oldSpecPath, newSpecPath) {
    try {
      console.log('🔍 Detecting changes between OpenAPI specifications...');
      
      // Load specifications
      const oldSpec = this.loadSpec(oldSpecPath);
      const newSpec = this.loadSpec(newSpecPath);
      
      if (!oldSpec || !newSpec) {
        throw new Error('Failed to load one or both specifications');
      }
      
      // Compare specifications
      this.compareEndpoints(oldSpec, newSpec);
      this.compareSchemas(oldSpec, newSpec);
      this.compareMetadata(oldSpec, newSpec);
      this.detectBreakingChanges(oldSpec, newSpec);
      
      // Generate summary
      const summary = this.generateSummary();
      const hasChanges = this.hasSignificantChanges();
      const hasBreakingChanges = this.changes.breaking.length > 0;
      
      // Write results to temporary files for GitHub Actions
      fs.writeFileSync('/tmp/has-changes', hasChanges.toString());
      fs.writeFileSync('/tmp/breaking-changes', hasBreakingChanges.toString());
      fs.writeFileSync('/tmp/change-summary.json', JSON.stringify(summary, null, 2));
      
      console.log(`✅ Change detection complete:`);
      console.log(`   - Has changes: ${hasChanges}`);
      console.log(`   - Breaking changes: ${hasBreakingChanges}`);
      console.log(`   - Endpoints added: ${this.changes.endpoints.added.length}`);
      console.log(`   - Endpoints modified: ${this.changes.endpoints.modified.length}`);
      console.log(`   - Endpoints removed: ${this.changes.endpoints.removed.length}`);
      
      return {
        hasChanges,
        hasBreakingChanges,
        summary
      };
      
    } catch (error) {
      console.error('❌ Error detecting changes:', error.message);
      
      // Default to assuming changes exist on error
      fs.writeFileSync('/tmp/has-changes', 'true');
      fs.writeFileSync('/tmp/breaking-changes', 'false');
      fs.writeFileSync('/tmp/change-summary.json', JSON.stringify({
        error: error.message,
        message: 'Change detection failed, assuming changes exist'
      }, null, 2));
      
      process.exit(1);
    }
  }

  loadSpec(specPath) {
    try {
      if (!fs.existsSync(specPath)) {
        console.warn(`⚠️  Specification file not found: ${specPath}`);
        return null;
      }
      
      const content = fs.readFileSync(specPath, 'utf8');
      
      // Try to parse as YAML first, then JSON
      try {
        return yaml.load(content);
      } catch (yamlError) {
        try {
          return JSON.parse(content);
        } catch (jsonError) {
          console.error(`❌ Failed to parse specification: ${specPath}`);
          return null;
        }
      }
    } catch (error) {
      console.error(`❌ Error loading specification: ${error.message}`);
      return null;
    }
  }

  compareEndpoints(oldSpec, newSpec) {
    const oldPaths = oldSpec.paths || {};
    const newPaths = newSpec.paths || {};
    
    const oldEndpoints = this.extractEndpoints(oldPaths);
    const newEndpoints = this.extractEndpoints(newPaths);
    
    // Find added endpoints
    for (const endpoint of newEndpoints) {
      if (!oldEndpoints.find(old => old.path === endpoint.path && old.method === endpoint.method)) {
        this.changes.endpoints.added.push(endpoint);
      }
    }
    
    // Find removed endpoints
    for (const endpoint of oldEndpoints) {
      if (!newEndpoints.find(newEp => newEp.path === endpoint.path && newEp.method === endpoint.method)) {
        this.changes.endpoints.removed.push(endpoint);
      }
    }
    
    // Find modified endpoints
    for (const newEndpoint of newEndpoints) {
      const oldEndpoint = oldEndpoints.find(old => 
        old.path === newEndpoint.path && old.method === newEndpoint.method
      );
      
      if (oldEndpoint && this.endpointChanged(oldEndpoint, newEndpoint)) {
        this.changes.endpoints.modified.push({
          ...newEndpoint,
          changes: this.getEndpointChanges(oldEndpoint, newEndpoint)
        });
      }
    }
  }

  extractEndpoints(paths) {
    const endpoints = [];
    
    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {}
          });
        }
      }
    }
    
    return endpoints;
  }

  endpointChanged(oldEndpoint, newEndpoint) {
    // Simple comparison - could be made more sophisticated
    return JSON.stringify(oldEndpoint) !== JSON.stringify(newEndpoint);
  }

  getEndpointChanges(oldEndpoint, newEndpoint) {
    const changes = [];
    
    if (oldEndpoint.summary !== newEndpoint.summary) {
      changes.push('summary');
    }
    
    if (JSON.stringify(oldEndpoint.parameters) !== JSON.stringify(newEndpoint.parameters)) {
      changes.push('parameters');
    }
    
    if (JSON.stringify(oldEndpoint.requestBody) !== JSON.stringify(newEndpoint.requestBody)) {
      changes.push('requestBody');
    }
    
    if (JSON.stringify(oldEndpoint.responses) !== JSON.stringify(newEndpoint.responses)) {
      changes.push('responses');
    }
    
    return changes;
  }

  compareSchemas(oldSpec, newSpec) {
    const oldSchemas = oldSpec.components?.schemas || {};
    const newSchemas = newSpec.components?.schemas || {};
    
    const oldSchemaNames = Object.keys(oldSchemas);
    const newSchemaNames = Object.keys(newSchemas);
    
    // Find added schemas
    for (const schemaName of newSchemaNames) {
      if (!oldSchemaNames.includes(schemaName)) {
        this.changes.schemas.added.push(schemaName);
      }
    }
    
    // Find removed schemas
    for (const schemaName of oldSchemaNames) {
      if (!newSchemaNames.includes(schemaName)) {
        this.changes.schemas.removed.push(schemaName);
      }
    }
    
    // Find modified schemas
    for (const schemaName of newSchemaNames) {
      if (oldSchemaNames.includes(schemaName)) {
        const oldSchema = oldSchemas[schemaName];
        const newSchema = newSchemas[schemaName];
        
        if (JSON.stringify(oldSchema) !== JSON.stringify(newSchema)) {
          this.changes.schemas.modified.push(schemaName);
        }
      }
    }
  }

  compareMetadata(oldSpec, newSpec) {
    this.changes.metadata = {
      version: {
        old: oldSpec.info?.version,
        new: newSpec.info?.version,
        changed: oldSpec.info?.version !== newSpec.info?.version
      },
      title: {
        old: oldSpec.info?.title,
        new: newSpec.info?.title,
        changed: oldSpec.info?.title !== newSpec.info?.title
      }
    };
  }

  detectBreakingChanges(oldSpec, newSpec) {
    // Removed endpoints are breaking changes
    for (const endpoint of this.changes.endpoints.removed) {
      this.changes.breaking.push({
        type: 'removed_endpoint',
        severity: 'high',
        description: `Endpoint ${endpoint.method} ${endpoint.path} was removed`,
        endpoint
      });
    }
    
    // Removed schemas are potentially breaking
    for (const schemaName of this.changes.schemas.removed) {
      this.changes.breaking.push({
        type: 'removed_schema',
        severity: 'medium',
        description: `Schema ${schemaName} was removed`,
        schema: schemaName
      });
    }
    
    // TODO: Add more sophisticated breaking change detection
    // - Required parameter additions
    // - Response schema changes
    // - Parameter type changes
  }

  hasSignificantChanges() {
    return (
      this.changes.endpoints.added.length > 0 ||
      this.changes.endpoints.removed.length > 0 ||
      this.changes.endpoints.modified.length > 0 ||
      this.changes.schemas.added.length > 0 ||
      this.changes.schemas.removed.length > 0 ||
      this.changes.schemas.modified.length > 0 ||
      this.changes.metadata.version.changed ||
      this.changes.metadata.title.changed
    );
  }

  generateSummary() {
    return {
      timestamp: new Date().toISOString(),
      hasChanges: this.hasSignificantChanges(),
      hasBreakingChanges: this.changes.breaking.length > 0,
      summary: {
        endpoints: {
          added: this.changes.endpoints.added.length,
          modified: this.changes.endpoints.modified.length,
          removed: this.changes.endpoints.removed.length
        },
        schemas: {
          added: this.changes.schemas.added.length,
          modified: this.changes.schemas.modified.length,
          removed: this.changes.schemas.removed.length
        },
        breakingChanges: this.changes.breaking.length
      },
      details: {
        endpoints: this.changes.endpoints,
        schemas: this.changes.schemas,
        breaking: this.changes.breaking,
        metadata: this.changes.metadata
      }
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node detect-changes.js <old-spec-path> <new-spec-path>');
    process.exit(1);
  }
  
  const [oldSpecPath, newSpecPath] = args;
  const detector = new OpenAPIChangeDetector();
  
  await detector.detectChanges(oldSpecPath, newSpecPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default OpenAPIChangeDetector;
