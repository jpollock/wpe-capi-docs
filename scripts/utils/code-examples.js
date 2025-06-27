/**
 * Code Example Generator for WP Engine Customer API Documentation
 * 
 * Generates consistent code examples across multiple languages for API endpoints.
 * Follows the patterns defined in .clinerules and memory-bank documentation.
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate code examples for an endpoint
 */
export class CodeExampleGenerator {
  constructor(spec) {
    this.spec = spec;
    this.baseUrl = `${spec.schemes[0]}://${spec.host}${spec.basePath}`;
  }

  /**
   * Generate all code examples for an endpoint
   */
  generateExamples(endpoint) {
    return {
      curl: this.generateCurl(endpoint),
      php: this.generatePhp(endpoint),
      python: this.generatePython(endpoint),
      nodejs: this.generateNodejs(endpoint)
    };
  }

  /**
   * Generate cURL example
   */
  generateCurl(endpoint) {
    const url = this.buildUrl(endpoint);
    const method = endpoint.method;
    const hasAuth = this.requiresAuth(endpoint);
    
    let curl = `curl -X ${method}`;
    
    if (hasAuth) {
      curl += ` \\\n  -u "API_USER_ID:API_USER_PASSWORD"`;
    }
    
    if (this.hasJsonBody(endpoint)) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${this.getExampleRequestBody(endpoint)}'`;
    }
    
    curl += ` \\\n  "${url}"`;
    
    return curl;
  }

  /**
   * Generate PHP example using GuzzleHttp
   */
  generatePhp(endpoint) {
    const url = this.buildUrl(endpoint);
    const method = endpoint.method.toLowerCase();
    const hasAuth = this.requiresAuth(endpoint);
    const hasBody = this.hasJsonBody(endpoint);
    
    let php = `<?php\nrequire_once 'vendor/autoload.php';\n\n`;
    php += `use GuzzleHttp\\Client;\n\n`;
    php += `$client = new Client();\n`;
    
    if (hasAuth) {
      php += `$auth = base64_encode('API_USER_ID:API_USER_PASSWORD');\n\n`;
    }
    
    php += `try {\n`;
    php += `    $response = $client->${method}('${url}'`;
    
    if (hasAuth || hasBody) {
      php += `, [\n`;
      
      if (hasAuth) {
        php += `        'headers' => [\n`;
        php += `            'Authorization' => 'Basic ' . $auth`;
        if (hasBody) {
          php += `,\n            'Content-Type' => 'application/json'`;
        }
        php += `\n        ]`;
      }
      
      if (hasBody) {
        if (hasAuth) php += `,\n`;
        php += `        'json' => ${this.getExampleRequestBodyPhp(endpoint)}`;
      }
      
      php += `\n    ]`;
    }
    
    php += `);\n\n`;
    php += `    $data = json_decode($response->getBody(), true);\n`;
    php += `    print_r($data);\n`;
    php += `} catch (Exception $e) {\n`;
    php += `    echo 'Error: ' . $e->getMessage();\n`;
    php += `}\n?>`;
    
    return php;
  }

  /**
   * Generate Python example using requests
   */
  generatePython(endpoint) {
    const url = this.buildUrl(endpoint);
    const method = endpoint.method.toLowerCase();
    const hasAuth = this.requiresAuth(endpoint);
    const hasBody = this.hasJsonBody(endpoint);
    
    let python = `import requests\nimport json\n`;
    if (hasAuth) {
      python += `import base64\n`;
    }
    python += `\n`;
    
    python += `url = "${url}"\n`;
    
    if (hasAuth) {
      python += `auth_string = base64.b64encode('API_USER_ID:API_USER_PASSWORD'.encode()).decode()\n`;
      python += `headers = {\n`;
      python += `    'Authorization': f'Basic {auth_string}'`;
      if (hasBody) {
        python += `,\n    'Content-Type': 'application/json'`;
      }
      python += `\n}\n`;
    } else if (hasBody) {
      python += `headers = {\n`;
      python += `    'Content-Type': 'application/json'\n`;
      python += `}\n`;
    }
    
    if (hasBody) {
      python += `\ndata = ${this.getExampleRequestBodyPython(endpoint)}\n`;
    }
    
    python += `\ntry:\n`;
    python += `    response = requests.${method}(url`;
    
    if (hasAuth && !hasBody) {
      python += `, headers=headers`;
    } else if (!hasAuth && hasBody) {
      python += `, headers=headers, json=data`;
    } else if (hasAuth && hasBody) {
      python += `, headers=headers, json=data`;
    }
    
    python += `)\n`;
    python += `    response.raise_for_status()\n`;
    python += `    result = response.json()\n`;
    python += `    print(json.dumps(result, indent=2))\n`;
    python += `except requests.exceptions.RequestException as e:\n`;
    python += `    print(f"Error: {e}")`;
    
    return python;
  }

  /**
   * Generate Node.js example using axios
   */
  generateNodejs(endpoint) {
    const url = this.buildUrl(endpoint);
    const method = endpoint.method.toLowerCase();
    const hasAuth = this.requiresAuth(endpoint);
    const hasBody = this.hasJsonBody(endpoint);
    
    let nodejs = `const axios = require('axios');\n\n`;
    
    nodejs += `const config = {\n`;
    nodejs += `  method: '${method}',\n`;
    nodejs += `  url: '${url}'`;
    
    if (hasAuth || hasBody) {
      nodejs += `,\n  headers: {`;
      
      if (hasAuth) {
        nodejs += `\n    'Authorization': 'Basic ' + Buffer.from('API_USER_ID:API_USER_PASSWORD').toString('base64')`;
      }
      
      if (hasBody) {
        if (hasAuth) nodejs += `,`;
        nodejs += `\n    'Content-Type': 'application/json'`;
      }
      
      nodejs += `\n  }`;
    }
    
    if (hasBody) {
      nodejs += `,\n  data: ${this.getExampleRequestBodyJs(endpoint)}`;
    }
    
    nodejs += `\n};\n\n`;
    
    nodejs += `async function makeRequest() {\n`;
    nodejs += `  try {\n`;
    nodejs += `    const response = await axios(config);\n`;
    nodejs += `    console.log(JSON.stringify(response.data, null, 2));\n`;
    nodejs += `  } catch (error) {\n`;
    nodejs += `    console.error('Error:', error.response?.data || error.message);\n`;
    nodejs += `  }\n`;
    nodejs += `}\n\n`;
    nodejs += `makeRequest();`;
    
    return nodejs;
  }

  /**
   * Build the full URL for an endpoint with example parameters
   */
  buildUrl(endpoint) {
    let url = this.baseUrl + endpoint.path;
    
    // Replace path parameters with examples
    endpoint.parameters.path.forEach(param => {
      const example = param.example || this.getExampleValue(param.type, param.format);
      url = url.replace(`{${param.name}}`, example);
    });
    
    // Add query parameters if any
    if (endpoint.parameters.query.length > 0) {
      const queryParams = endpoint.parameters.query
        .filter(param => param.required || param.example)
        .map(param => {
          const value = param.example || this.getExampleValue(param.type, param.format);
          return `${param.name}=${encodeURIComponent(value)}`;
        });
      
      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }
    }
    
    return url;
  }

  /**
   * Check if endpoint requires authentication
   */
  requiresAuth(endpoint) {
    return endpoint.security && endpoint.security.length > 0;
  }

  /**
   * Check if endpoint has JSON request body
   */
  hasJsonBody(endpoint) {
    return endpoint.method !== 'GET' && endpoint.method !== 'DELETE' && 
           (endpoint.requestBody || this.methodTypicallyHasBody(endpoint.method));
  }

  /**
   * Check if HTTP method typically has a body
   */
  methodTypicallyHasBody(method) {
    return ['POST', 'PUT', 'PATCH'].includes(method);
  }

  /**
   * Get example request body as JSON string
   */
  getExampleRequestBody(endpoint) {
    if (endpoint.requestBody && endpoint.requestBody.examples) {
      return JSON.stringify(endpoint.requestBody.examples.default || Object.values(endpoint.requestBody.examples)[0], null, 2);
    }
    
    // Generate basic example based on endpoint
    return this.generateBasicRequestExample(endpoint);
  }

  /**
   * Get example request body for PHP
   */
  getExampleRequestBodyPhp(endpoint) {
    const example = this.getBasicRequestObject(endpoint);
    return this.objectToPhpArray(example);
  }

  /**
   * Get example request body for Python
   */
  getExampleRequestBodyPython(endpoint) {
    const example = this.getBasicRequestObject(endpoint);
    return JSON.stringify(example, null, 4);
  }

  /**
   * Get example request body for JavaScript
   */
  getExampleRequestBodyJs(endpoint) {
    const example = this.getBasicRequestObject(endpoint);
    return JSON.stringify(example, null, 2);
  }

  /**
   * Generate basic request example
   */
  generateBasicRequestExample(endpoint) {
    const example = this.getBasicRequestObject(endpoint);
    return JSON.stringify(example, null, 2);
  }

  /**
   * Get basic request object based on endpoint
   */
  getBasicRequestObject(endpoint) {
    // Create a basic example based on the endpoint operation
    const operationId = endpoint.operationId || '';
    
    if (operationId.includes('create') || operationId.includes('Create')) {
      if (operationId.includes('Site')) {
        return { name: "My New Site" };
      } else if (operationId.includes('Install')) {
        return { name: "mynewsite" };
      } else if (operationId.includes('Domain')) {
        return { name: "example.com", primary: true };
      } else if (operationId.includes('AccountUser')) {
        return { 
          email: "user@example.com",
          first_name: "John",
          last_name: "Doe",
          roles: "partial"
        };
      } else if (operationId.includes('SshKey')) {
        return { 
          public_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...",
          comment: "user@example.com"
        };
      }
    } else if (operationId.includes('update') || operationId.includes('Update')) {
      if (operationId.includes('Site')) {
        return { name: "Updated Site Name" };
      } else if (operationId.includes('AccountUser')) {
        return { roles: "full" };
      } else if (operationId.includes('Domain')) {
        return { primary: true };
      }
    } else if (operationId.includes('purge') || operationId.includes('Purge')) {
      return { type: "all" };
    }
    
    return {};
  }

  /**
   * Convert object to PHP array syntax
   */
  objectToPhpArray(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }
    
    const entries = Object.entries(obj).map(([key, value]) => {
      const phpValue = typeof value === 'string' ? `'${value}'` : 
                      typeof value === 'boolean' ? (value ? 'true' : 'false') :
                      typeof value === 'object' ? this.objectToPhpArray(value) :
                      value;
      return `    '${key}' => ${phpValue}`;
    });
    
    return `[\n${entries.join(',\n')}\n]`;
  }

  /**
   * Get example value for a parameter type
   */
  getExampleValue(type, format) {
    if (format === 'uuid') {
      return 'a1b2c3d4-e5f6-41b2-b3d4-e5f6a1b2c3d4';
    }
    
    switch (type) {
      case 'string':
        return 'example-value';
      case 'integer':
        return '100';
      case 'boolean':
        return 'true';
      case 'number':
        return '10.5';
      default:
        return 'example';
    }
  }
}

export default CodeExampleGenerator;
