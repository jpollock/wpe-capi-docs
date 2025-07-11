#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { OpenAPIParser } from './parse-openapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Navigation Updater for WP Engine Customer API Documentation
 * 
 * Automatically updates the Astro configuration sidebar with generated endpoints.
 * Preserves existing manual navigation items while adding generated content.
 */

class NavigationUpdater {
  constructor(options = {}) {
    this.options = {
      specPath: path.resolve(__dirname, '../public/openapi/v1.yaml'),
      configPath: path.resolve(__dirname, '../astro.config.mjs'),
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.parser = null;
    this.data = null;
    this.configContent = '';
  }

  /**
   * Main update process
   */
  async update() {
    try {
      console.log(chalk.bold.blue('🧭 WP Engine API Navigation Updater\n'));
      
      await this.parseOpenAPI();
      await this.readConfig();
      await this.updateSidebar();
      await this.writeConfig();
      
      console.log(chalk.bold.green('\n✨ Navigation update completed!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Navigation update failed:'), error.message);
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
    
    this.log(`✅ Found ${this.data.stats.totalTags} sections with ${this.data.stats.totalEndpoints} endpoints`);
  }

  /**
   * Read current Astro configuration
   */
  async readConfig() {
    this.log('📄 Reading Astro configuration...');
    
    this.configContent = await fs.readFile(this.options.configPath, 'utf8');
    
    this.log('✅ Configuration loaded');
  }

  /**
   * Update the sidebar configuration
   */
  async updateSidebar() {
    this.log('🔧 Updating sidebar configuration...');
    
    // Generate the new API Reference section
    const apiReferenceSection = this.generateApiReferenceSection();
    
    // Find and replace the existing API Reference section
    const updatedConfig = this.replaceSidebarSection(this.configContent, apiReferenceSection);
    
    this.configContent = updatedConfig;
    
    this.log('✅ Sidebar configuration updated');
  }

  /**
   * Generate the API Reference section for the sidebar
   */
  generateApiReferenceSection() {
    const endpointsItems = this.data.tags.map(tag => {
      const tagSlug = this.kebabCase(tag.name);
      const endpointItems = tag.endpoints.map(endpoint => ({
        label: endpoint.displayName,
        link: `/api-reference/endpoints/${tagSlug}/${endpoint.slug}/`
      }));

      return {
        label: tag.displayName,
        collapsed: true,
        items: [
          { label: 'Overview', link: `/api-reference/endpoints/${tagSlug}/` },
          ...endpointItems
        ]
      };
    });

    return {
      label: 'API Reference',
      items: [
        { label: 'Overview', link: '/api-reference/overview/' },
        { label: 'Authentication', link: '/api-reference/authentication/' },
        { label: 'Pagination', link: '/api-reference/pagination/' },
        {
          label: 'Endpoints',
          collapsed: false,
          items: [
            { label: 'All Endpoints', link: '/api-reference/endpoints/' },
            ...endpointsItems
          ]
        }
      ]
    };
  }

  /**
   * Replace the sidebar section in the config content
   */
  replaceSidebarSection(configContent, newApiSection) {
    // Convert the section to a properly formatted string
    const sectionString = this.formatSidebarSection(newApiSection);
    
    // Find the sidebar array and replace the API Reference section within it
    const sidebarMatch = configContent.match(/sidebar:\s*\[([\s\S]*?)\]/);
    if (!sidebarMatch) {
      this.log('Warning: Could not find sidebar array in config');
      return configContent;
    }
    
    const sidebarContent = sidebarMatch[1];
    
    // Look for existing API Reference section using a more robust approach
    // Split by sections and find the API Reference one
    const sections = this.parseSidebarSections(sidebarContent);
    let apiRefIndex = -1;
    
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].includes("label: 'API Reference'") || 
          sections[i].includes('label: "API Reference"') ||
          sections[i].includes('label: `API Reference`')) {
        apiRefIndex = i;
        break;
      }
    }
    
    if (apiRefIndex !== -1) {
      this.log('Found existing API Reference section, replacing...');
      sections[apiRefIndex] = sectionString;
    } else {
      this.log('No existing API Reference section found, adding new one...');
      // Insert before the last section (Try!)
      sections.splice(-1, 0, sectionString);
    }
    
    // Reconstruct the sidebar
    const newSidebarContent = sections.join(',\n');
    const newConfigContent = configContent.replace(
      /sidebar:\s*\[[\s\S]*?\]/,
      `sidebar: [\n${newSidebarContent}\n          ]`
    );
    
    return newConfigContent;
  }

  /**
   * Parse sidebar sections by finding balanced braces
   */
  parseSidebarSections(sidebarContent) {
    const sections = [];
    let currentSection = '';
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let escaped = false;
    
    for (let i = 0; i < sidebarContent.length; i++) {
      const char = sidebarContent[i];
      const prevChar = i > 0 ? sidebarContent[i - 1] : '';
      
      currentSection += char;
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      } else if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          
          if (braceCount === 0) {
            // End of a section
            sections.push(currentSection.trim());
            currentSection = '';
            
            // Skip any trailing comma and whitespace
            while (i + 1 < sidebarContent.length && 
                   (sidebarContent[i + 1] === ',' || /\s/.test(sidebarContent[i + 1]))) {
              i++;
            }
          }
        }
      }
    }
    
    // Add any remaining content
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    return sections;
  }

  /**
   * Format a sidebar section as a string
   */
  formatSidebarSection(section, indent = '              ') {
    const formatItems = (items, currentIndent) => {
      return items.map(item => {
        if (item.items) {
          const subItems = formatItems(item.items, currentIndent + '    ');
          const subItemsString = subItems.join(',\n');
          return `${currentIndent}{\n${currentIndent}    label: '${this.escapeJavaScriptString(item.label)}',\n${currentIndent}    collapsed: ${item.collapsed || false},\n${currentIndent}    items: [\n${subItemsString}\n${currentIndent}    ]\n${currentIndent}}`;
        } else {
          return `${currentIndent}{ label: '${this.escapeJavaScriptString(item.label)}', link: '${item.link}' }`;
        }
      });
    };

    const itemsArray = formatItems(section.items, indent + '    ');
    const itemsString = itemsArray.join(',\n');
    
    return `${indent}{\n${indent}    label: '${this.escapeJavaScriptString(section.label)}',\n${indent}    items: [\n${itemsString}\n${indent}    ]\n${indent}}`;
  }

  /**
   * Write the updated configuration
   */
  async writeConfig() {
    if (this.options.dryRun) {
      this.log('[DRY RUN] Would write updated configuration');
      if (this.options.verbose) {
        console.log('\n--- Updated Configuration ---');
        console.log(this.configContent);
        console.log('--- End Configuration ---\n');
      }
      return;
    }
    
    this.log('💾 Writing updated configuration...');
    
    await fs.writeFile(this.options.configPath, this.configContent, 'utf8');
    
    this.log('✅ Configuration written successfully');
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
   * Escape string for safe use in JavaScript string literals
   */
  escapeJavaScriptString(str) {
    return str
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/'/g, "\\'")    // Escape single quotes
      .replace(/"/g, '\\"')    // Escape double quotes
      .replace(/\n/g, '\\n')   // Escape newlines
      .replace(/\r/g, '\\r')   // Escape carriage returns
      .replace(/\t/g, '\\t');  // Escape tabs
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
  
  const updater = new NavigationUpdater(options);
  await updater.update();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { NavigationUpdater };
