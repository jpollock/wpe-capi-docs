#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Content Validator for WP Engine Customer API Documentation
 * 
 * Validates generated documentation for:
 * - MDX syntax errors
 * - Broken internal links
 * - Missing content markers
 * - Consistent formatting
 */

class ContentValidator {
  constructor(options = {}) {
    this.options = {
      contentDir: path.resolve(__dirname, '../src/content/docs'),
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      filesChecked: 0,
      errors: [],
      warnings: [],
      internalLinks: new Set(),
      existingFiles: new Set()
    };
  }

  /**
   * Main validation process
   */
  async validate() {
    try {
      console.log(chalk.bold.blue('🔍 WP Engine API Content Validator\n'));
      
      await this.scanFiles();
      await this.validateFiles();
      await this.validateLinks();
      
      this.printSummary();
      
      // Exit with error code if there are errors
      if (this.stats.errors.length > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Validation failed:'), error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Scan for all content files
   */
  async scanFiles() {
    this.log('📁 Scanning content files...');
    
    const pattern = path.join(this.options.contentDir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      const relativePath = path.relative(this.options.contentDir, file);
      this.stats.existingFiles.add('/' + relativePath.replace(/\.(md|mdx)$/, '/'));
    });
    
    this.log(`✅ Found ${files.length} content files`);
    return files;
  }

  /**
   * Validate all content files
   */
  async validateFiles() {
    this.log('🔍 Validating content files...');
    
    const files = await this.scanFiles();
    
    for (const file of files) {
      try {
        await this.validateFile(file);
        this.stats.filesChecked++;
      } catch (error) {
        this.addError(file, `File validation failed: ${error.message}`);
      }
    }
    
    this.log(`✅ Validated ${this.stats.filesChecked} files`);
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(this.options.contentDir, filePath);
    
    this.verbose(`Checking: ${relativePath}`);
    
    // Check for basic MDX syntax issues
    this.validateMdxSyntax(filePath, content);
    
    // Check for content markers in generated files
    this.validateContentMarkers(filePath, content);
    
    // Extract internal links
    this.extractInternalLinks(filePath, content);
    
    // Check for common formatting issues
    this.validateFormatting(filePath, content);
  }

  /**
   * Validate MDX syntax
   */
  validateMdxSyntax(filePath, content) {
    // Remove code blocks from content before checking for JSX issues
    const contentWithoutCodeBlocks = this.removeCodeBlocks(content);
    
    // Check for unmatched braces in JSX (only outside of code blocks)
    const jsxBraceRegex = /{[^}]*$/gm;
    const unmatchedBraces = contentWithoutCodeBlocks.match(jsxBraceRegex);
    if (unmatchedBraces) {
      this.addError(filePath, `Unmatched JSX braces found: ${unmatchedBraces.join(', ')}`);
    }
    
    // Check for unclosed JSX tags (only outside of code blocks)
    const unclosedTagRegex = /<[A-Z][a-zA-Z]*[^>]*(?<!\/|>)$/gm;
    const unclosedTags = contentWithoutCodeBlocks.match(unclosedTagRegex);
    if (unclosedTags) {
      this.addError(filePath, `Unclosed JSX tags found: ${unclosedTags.join(', ')}`);
    }
    
    // Check for invalid frontmatter
    if (content.startsWith('---')) {
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd === -1) {
        this.addError(filePath, 'Unclosed frontmatter block');
      }
    }
  }

  /**
   * Remove code blocks from content to avoid false positives in JSX validation
   */
  removeCodeBlocks(content) {
    // Remove triple backtick code blocks
    let cleanContent = content.replace(/```[\s\S]*?```/g, '');
    
    // Remove single backtick inline code
    cleanContent = cleanContent.replace(/`[^`\n]*`/g, '');
    
    // Remove indented code blocks (4+ spaces at start of line)
    cleanContent = cleanContent.replace(/^[ ]{4,}.*$/gm, '');
    
    return cleanContent;
  }

  /**
   * Validate content markers
   */
  validateContentMarkers(filePath, content) {
    const isGenerated = content.includes('AUTO-GENERATED: Do not edit directly');
    const isHybrid = content.includes('HYBRID: Contains both auto-generated and custom content');
    const isHumanEditable = content.includes('HUMAN-EDITABLE: Safe to modify');
    
    // Check if generated files have proper markers
    if (filePath.includes('/api-reference/endpoints/') && !isGenerated && !isHybrid && !isHumanEditable) {
      this.addWarning(filePath, 'API endpoint file missing content type marker');
    }
    
    // Check for orphaned custom sections
    const customStartRegex = /CUSTOM-START: ([^}]+)/g;
    const customEndRegex = /CUSTOM-END: ([^}]+)/g;
    
    const customStarts = [...content.matchAll(customStartRegex)];
    const customEnds = [...content.matchAll(customEndRegex)];
    
    if (customStarts.length !== customEnds.length) {
      this.addError(filePath, 'Mismatched CUSTOM-START/CUSTOM-END markers');
    }
  }

  /**
   * Extract internal links for validation
   */
  extractInternalLinks(filePath, content) {
    // Match markdown links and MDX links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(linkRegex)];
    
    matches.forEach(match => {
      const url = match[2];
      if (url.startsWith('/') && !url.startsWith('//')) {
        this.stats.internalLinks.add({
          file: filePath,
          url: url,
          text: match[1]
        });
      }
    });
  }

  /**
   * Validate formatting consistency
   */
  validateFormatting(filePath, content) {
    // Check for inconsistent heading levels
    const headings = content.match(/^#+\s+.+$/gm) || [];
    let lastLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = heading.match(/^#+/)[0].length;
      if (level > lastLevel + 1) {
        this.addWarning(filePath, `Heading level jump from H${lastLevel} to H${level}: "${heading.trim()}"`);
      }
      lastLevel = level;
    });
    
    // Check for missing alt text in images
    const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
    const images = [...content.matchAll(imageRegex)];
    
    images.forEach(match => {
      if (!match[1] || match[1].trim() === '') {
        this.addWarning(filePath, 'Image missing alt text');
      }
    });
  }

  /**
   * Validate internal links
   */
  async validateLinks() {
    this.log('🔗 Validating internal links...');
    
    let brokenLinks = 0;
    
    for (const link of this.stats.internalLinks) {
      const targetPath = link.url.endsWith('/') ? link.url : link.url + '/';
      
      if (!this.stats.existingFiles.has(targetPath)) {
        this.addError(link.file, `Broken internal link: ${link.url} (text: "${link.text}")`);
        brokenLinks++;
      }
    }
    
    if (brokenLinks === 0) {
      this.log(`✅ All ${this.stats.internalLinks.size} internal links are valid`);
    } else {
      this.log(`❌ Found ${brokenLinks} broken internal links`);
    }
  }

  /**
   * Add an error
   */
  addError(file, message) {
    this.stats.errors.push({
      file: path.relative(this.options.contentDir, file),
      message,
      type: 'error'
    });
  }

  /**
   * Add a warning
   */
  addWarning(file, message) {
    this.stats.warnings.push({
      file: path.relative(this.options.contentDir, file),
      message,
      type: 'warning'
    });
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
   * Print validation summary
   */
  printSummary() {
    console.log(chalk.bold.green('\n✨ Content validation completed!'));
    console.log(chalk.gray('📊 Summary:'));
    console.log(chalk.gray(`   • ${this.stats.filesChecked} files validated`));
    console.log(chalk.gray(`   • ${this.stats.internalLinks.size} internal links checked`));
    
    if (this.stats.errors.length > 0) {
      console.log(chalk.red(`   • ${this.stats.errors.length} errors found`));
      
      console.log(chalk.red('\n❌ Errors:'));
      this.stats.errors.forEach(error => {
        console.log(chalk.red(`   • ${error.file}: ${error.message}`));
      });
    }
    
    if (this.stats.warnings.length > 0) {
      console.log(chalk.yellow(`   • ${this.stats.warnings.length} warnings found`));
      
      if (this.options.verbose) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        this.stats.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning.file}: ${warning.message}`));
        });
      }
    }
    
    if (this.stats.errors.length === 0 && this.stats.warnings.length === 0) {
      console.log(chalk.green('   • No issues found! 🎉'));
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
  
  const validator = new ContentValidator(options);
  await validator.validate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { ContentValidator };
