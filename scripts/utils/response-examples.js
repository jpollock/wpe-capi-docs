/**
 * Response Example Generator for WP Engine Customer API Documentation
 * 
 * Generates realistic JSON response examples from OpenAPI schema definitions.
 * Converts schema objects into properly formatted example responses.
 */

/**
 * Generate response examples from OpenAPI schemas
 */
export class ResponseExampleGenerator {
  constructor(spec) {
    this.spec = spec;
    this.definitions = spec.definitions || {};
  }

  /**
   * Generate example for a response schema
   */
  generateResponseExample(response) {
    if (!response.schema) {
      return null;
    }

    return this.generateFromSchema(response.schema);
  }

  /**
   * Generate example from schema definition
   */
  generateFromSchema(schema) {
    if (!schema) return null;

    // Handle $ref references
    if (schema.$ref) {
      const refName = schema.$ref.replace('#/definitions/', '');
      const definition = this.definitions[refName];
      if (definition) {
        return this.generateFromSchema(definition);
      }
      return null;
    }

    // Handle different schema types
    switch (schema.type) {
      case 'object':
        return this.generateObjectExample(schema);
      case 'array':
        return this.generateArrayExample(schema);
      case 'string':
        return this.generateStringExample(schema);
      case 'integer':
      case 'number':
        return this.generateNumberExample(schema);
      case 'boolean':
        return schema.example !== undefined ? schema.example : true;
      default:
        return schema.example || null;
    }
  }

  /**
   * Generate object example
   */
  generateObjectExample(schema) {
    const obj = {};
    
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        // Skip nullable properties that aren't required
        if (propSchema['x-nullable'] && !this.isRequired(schema, propName)) {
          continue;
        }
        
        obj[propName] = this.generateFromSchema(propSchema);
      }
    }

    return obj;
  }

  /**
   * Generate array example
   */
  generateArrayExample(schema) {
    if (schema.items) {
      const itemExample = this.generateFromSchema(schema.items);
      // Return array with 1-2 example items
      return itemExample ? [itemExample] : [];
    }
    return [];
  }

  /**
   * Generate string example
   */
  generateStringExample(schema) {
    // Use provided example if available
    if (schema.example !== undefined) {
      return schema.example;
    }

    // Generate based on format
    if (schema.format) {
      switch (schema.format) {
        case 'uuid':
          return this.generateUUID();
        case 'email':
          return 'user@example.com';
        case 'date-time':
          return new Date().toISOString();
        case 'uri':
          return 'https://api.wpengineapi.com/v1/example';
        default:
          return this.generateStringByName(schema);
      }
    }

    // Generate based on enum
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }

    return this.generateStringByName(schema);
  }

  /**
   * Generate string based on common property names
   */
  generateStringByName(schema, propName = '') {
    const name = propName.toLowerCase();
    
    if (name.includes('email')) return 'user@example.com';
    if (name.includes('phone')) return '1234567890';
    if (name.includes('name') && !name.includes('first') && !name.includes('last')) return 'Example Name';
    if (name.includes('first_name') || name.includes('firstname')) return 'John';
    if (name.includes('last_name') || name.includes('lastname')) return 'Doe';
    if (name.includes('description')) return 'Example description';
    if (name.includes('message')) return 'Operation completed successfully';
    if (name.includes('url')) return 'https://example.com';
    if (name.includes('domain')) return 'example.com';
    if (name.includes('cname')) return 'example.wpengine.com';
    if (name.includes('version')) return '1.0.0';
    if (name.includes('status')) return 'active';
    if (name.includes('environment')) return 'production';
    if (name.includes('role')) return 'full';
    if (name.includes('fingerprint')) return 'a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6';
    if (name.includes('comment')) return 'user@example.com';
    if (name.includes('public_key')) return 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@example.com';
    
    return 'example-value';
  }

  /**
   * Generate number example
   */
  generateNumberExample(schema) {
    if (schema.example !== undefined) {
      return schema.example;
    }
    
    if (schema.minimum !== undefined) {
      return schema.minimum;
    }
    
    return schema.type === 'integer' ? 100 : 10.5;
  }

  /**
   * Check if property is required
   */
  isRequired(schema, propName) {
    return schema.required && schema.required.includes(propName);
  }

  /**
   * Generate a realistic UUID
   */
  generateUUID() {
    return 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  }

  /**
   * Generate realistic examples for common WP Engine entities
   */
  generateRealisticExample(schemaName, schema) {
    const examples = {
      'Account': {
        id: 'eeda3227-9a39-46ae-9e14-20958bb4e6c9',
        name: 'My WP Engine Account'
      },
      'AccountUser': {
        user_id: '28c78b6d-c2da-4f09-85f5-1ad588089b2d',
        account_id: 'eeda3227-9a39-46ae-9e14-20958bb4e6c9',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        invite_accepted: true,
        mfa_enabled: false,
        roles: 'full,billing'
      },
      'Site': {
        id: '28c78b6d-c2da-4f09-85f5-1ad588089b2d',
        name: 'My WordPress Site',
        account: {
          id: 'eeda3227-9a39-46ae-9e14-20958bb4e6c9'
        }
      },
      'Installation': {
        id: '294deacc-d8b8-4005-82c4-0727ba8ddde0',
        name: 'mywordpresssite',
        account: {
          id: 'eeda3227-9a39-46ae-9e14-20958bb4e6c9'
        },
        php_version: '8.1',
        status: 'active',
        cname: 'mywordpresssite.wpengine.com',
        environment: 'production',
        primary_domain: 'example.com',
        is_multisite: false
      },
      'Domain': {
        id: 'e41fa98f-ea80-4654-b229-a9b765d0863a',
        name: 'example.com',
        duplicate: false,
        primary: true
      },
      'User': {
        id: 'fd8e24a5-1f16-4b80-af5f-d748bcc9e64d',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890'
      },
      'SshKey': {
        uuid: 'e41fa98f-ea80-1f16-a7b7-d748bcc9e64d',
        comment: 'user@example.com',
        created_at: '2024-01-15T10:30:00.000Z',
        fingerprint: 'a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6'
      },
      'Backup': {
        id: '28c78b6d-c2da-4f09-85f5-1ad588089b2d',
        status: 'completed'
      },
      'Status': {
        success: true,
        created_on: '2024-01-15T10:30:00+00:00'
      }
    };

    if (examples[schemaName]) {
      return examples[schemaName];
    }

    // Fall back to schema-based generation
    return this.generateFromSchema(schema);
  }

  /**
   * Generate contextually appropriate error examples based on endpoint and operation
   */
  generateContextualErrorExample(statusCode, endpoint, operation) {
    const errorExamples = {
      '400': {
        // Account-related errors
        'account': {
          'GET': {
            message: 'Invalid account ID format'
          },
          'POST': {
            message: 'Account name is required',
            errors: [
              {
                resource: 'Account',
                field: 'name',
                type: 'missing_field',
                code: 'required',
                message: 'Account name cannot be empty'
              }
            ]
          }
        },
        // Account User errors
        'account_user': {
          'GET': {
            message: 'Invalid user ID format'
          },
          'POST': {
            message: 'User email is required',
            errors: [
              {
                resource: 'AccountUser',
                field: 'email',
                type: 'missing_field',
                code: 'required',
                message: 'Email address is required'
              }
            ]
          },
          'PATCH': {
            message: 'Invalid role specified',
            errors: [
              {
                resource: 'AccountUser',
                field: 'roles',
                type: 'invalid_value',
                code: 'invalid_role',
                message: 'Role must be one of: owner, full, full,billing, partial, partial,billing'
              }
            ]
          }
        },
        // Site errors
        'site': {
          'GET': {
            message: 'Invalid site ID format'
          },
          'POST': {
            message: 'Site name is required',
            errors: [
              {
                resource: 'Site',
                field: 'name',
                type: 'missing_field',
                code: 'required',
                message: 'Site name cannot be empty'
              }
            ]
          },
          'PATCH': {
            message: 'Invalid site name',
            errors: [
              {
                resource: 'Site',
                field: 'name',
                type: 'invalid_value',
                code: 'too_long',
                message: 'Site name is too long (maximum is 40 characters)'
              }
            ]
          }
        },
        // Install errors
        'install': {
          'GET': {
            message: 'Invalid install ID format'
          },
          'POST': {
            message: 'Install name is required',
            errors: [
              {
                resource: 'Installation',
                field: 'name',
                type: 'missing_field',
                code: 'required',
                message: 'Installation name cannot be empty'
              }
            ]
          }
        },
        // Domain errors
        'domain': {
          'GET': {
            message: 'Invalid domain ID format'
          },
          'POST': {
            message: 'Domain name is required',
            errors: [
              {
                resource: 'Domain',
                field: 'name',
                type: 'missing_field',
                code: 'required',
                message: 'Domain name cannot be empty'
              }
            ]
          }
        },
        // SSH Key errors
        'ssh_key': {
          'POST': {
            message: 'Invalid SSH key format',
            errors: [
              {
                resource: 'SshKey',
                field: 'public_key',
                type: 'invalid_value',
                code: 'invalid_format',
                message: 'SSH key must be in valid OpenSSH format'
              }
            ]
          }
        },
        // Backup errors
        'backup': {
          'POST': {
            message: 'Backup description is required',
            errors: [
              {
                resource: 'Backup',
                field: 'description',
                type: 'missing_field',
                code: 'required',
                message: 'Backup description cannot be empty'
              }
            ]
          }
        },
        // Cache errors
        'cache': {
          'POST': {
            message: 'Invalid cache type',
            errors: [
              {
                resource: 'Cache',
                field: 'type',
                type: 'invalid_value',
                code: 'invalid_type',
                message: 'Cache type must be one of: object, page, cdn'
              }
            ]
          }
        },
        // Default fallback
        'default': {
          message: 'Bad request - invalid parameters'
        }
      },
      '401': {
        message: 'Authentication required'
      },
      '403': {
        message: 'Insufficient permissions to access this resource'
      },
      '404': {
        message: 'Resource not found'
      },
      '429': {
        message: 'Rate limit exceeded - too many requests'
      },
      '500': {
        message: 'Internal server error - please try again later'
      },
      '503': {
        message: 'Service temporarily unavailable'
      }
    };

    // For 400 errors, try to find contextual example
    if (statusCode === '400' && errorExamples['400']) {
      // Determine resource type from endpoint path
      let resourceType = 'default';
      if (endpoint.includes('/accounts') && endpoint.includes('/account_users')) {
        resourceType = 'account_user';
      } else if (endpoint.includes('/accounts')) {
        resourceType = 'account';
      } else if (endpoint.includes('/sites')) {
        resourceType = 'site';
      } else if (endpoint.includes('/installs') && endpoint.includes('/domains')) {
        resourceType = 'domain';
      } else if (endpoint.includes('/installs') && endpoint.includes('/backups')) {
        resourceType = 'backup';
      } else if (endpoint.includes('/installs') && endpoint.includes('/purge_cache')) {
        resourceType = 'cache';
      } else if (endpoint.includes('/installs')) {
        resourceType = 'install';
      } else if (endpoint.includes('/ssh_keys')) {
        resourceType = 'ssh_key';
      }

      const resourceErrors = errorExamples['400'][resourceType];
      if (resourceErrors && resourceErrors[operation]) {
        return resourceErrors[operation];
      } else if (resourceErrors && resourceErrors['GET']) {
        return resourceErrors['GET'];
      } else {
        return errorExamples['400']['default'];
      }
    }

    return errorExamples[statusCode] || {
      message: 'An error occurred'
    };
  }

  /**
   * Generate paginated response example
   */
  generatePaginatedExample(itemSchema, itemName = 'items') {
    const items = [];
    const exampleItem = this.generateFromSchema(itemSchema);
    
    if (exampleItem) {
      // Add 2-3 example items for lists
      items.push(exampleItem);
      
      // Create slight variations for additional items
      if (itemName === 'Account') {
        items.push({
          ...exampleItem,
          id: 'f1e2d3c4-b5a6-7890-cdef-123456789abc',
          name: 'Another Account'
        });
      } else if (itemName === 'Site') {
        items.push({
          ...exampleItem,
          id: 'b2c3d4e5-f6a7-8901-bcde-234567890def',
          name: 'Another WordPress Site'
        });
      }
    }

    return {
      previous: null,
      next: 'https://api.wpengineapi.com/v1/example?limit=100&offset=100',
      count: 25,
      results: items
    };
  }
}

export default ResponseExampleGenerator;
