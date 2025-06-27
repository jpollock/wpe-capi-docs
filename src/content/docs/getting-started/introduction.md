---
title: Introduction to the WP Engine Customer API
description: Learn about the WP Engine Customer API and how it can help you manage your WordPress sites programmatically.
---

The WP Engine Customer API provides a powerful interface for programmatically managing your WordPress sites hosted on WP Engine. This RESTful API allows developers to automate tasks, integrate with other systems, and build custom tools that interact with the WP Engine platform.

## What You Can Do

With the WP Engine Customer API, you can:

- **Manage Sites**: Create, update, and delete WordPress sites
- **Deploy Code**: Deploy code to your sites from Git repositories
- **Manage Environments**: Work with production, staging, and development environments
- **Monitor Performance**: Access performance metrics and logs
- **Automate Workflows**: Build automation for common tasks
- **Integrate Systems**: Connect WP Engine with your existing tools and systems

## API Design

The WP Engine Customer API follows RESTful principles:

- Uses standard HTTP methods (GET, POST, PUT, DELETE)
- Returns JSON responses
- Uses consistent URL patterns
- Implements proper status codes
- Provides comprehensive error messages

## Getting Started

To start using the API, you'll need to:

1. [Authenticate](/getting-started/authentication/) with your WP Engine credentials
2. Explore the [API Reference](/api-reference/overview/) to understand available endpoints
3. Try the [Quick Start Guide](/getting-started/quick-start/) for a hands-on introduction

## API Versions

The current version of the API is v1. All API requests should include the version in the URL path:

```
https://api.wpengineapi.com/v1/sites
```

## Rate Limiting

The WP Engine Customer API implements rate limiting to ensure fair usage. Current limits are:

- 1000 requests per hour per account
- 100 requests per minute per IP address

If you exceed these limits, you'll receive a `429 Too Many Requests` response.

## Support

If you encounter any issues or have questions about the API, please contact [WP Engine Support](https://wpengine.com/support/) or visit our [GitHub repository](https://github.com/wpengine/customer-api) for the latest updates and to report issues.
