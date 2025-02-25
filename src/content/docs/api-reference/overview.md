---
title: API Reference Overview
description: Overview of the WP Engine Customer API endpoints and functionality
---

# API Reference Overview

The WP Engine Customer API provides a comprehensive set of endpoints for managing your WordPress sites. This reference documentation will help you understand the available resources and how to interact with them.

## Base URL

All API requests should be made to the following base URL:

```
https://wpengineapi.com/v1
```

## API Versioning

The current version of the API is `v1`. The version is included in the URL path to ensure compatibility as the API evolves.

## Authentication

All API requests require authentication. See the [Authentication guide](/getting-started/authentication/) for details on how to authenticate your requests.

## Request Format

The API accepts JSON-encoded request bodies and form-encoded data for file uploads. Always include the appropriate `Content-Type` header:

- For JSON: `Content-Type: application/json`
- For form data: `Content-Type: multipart/form-data`

## Response Format

All responses are returned in JSON format. The structure typically includes:

- The requested data or a confirmation message
- Metadata about the request
- Pagination information (for list endpoints)

Example response:

```json
{
  "results": [
    {
      "id": "site_12345",
      "name": "My WordPress Site",
      "environment": "production",
      "created_at": "2023-01-15T12:00:00Z",
      "url": "https://mysite.wpengine.com",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 1,
    "count": 1,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  }
}
```

## HTTP Methods

The API uses standard HTTP methods:

- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update resources
- `DELETE`: Delete resources

## Status Codes

The API uses standard HTTP status codes to indicate the success or failure of a request:

| Code | Description |
|------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - The resource was successfully created |
| 204 | No Content - The request was successful but returns no content |
| 400 | Bad Request - The request was invalid |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - You don't have permission to access the resource |
| 404 | Not Found - The resource doesn't exist |
| 429 | Too Many Requests - You've exceeded the rate limit |
| 500 | Internal Server Error - Something went wrong on our end |

## Error Handling

When an error occurs, the API returns an error object with details about what went wrong:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The site ID is invalid",
    "details": {
      "field": "site_id",
      "reason": "must be a valid UUID"
    }
  }
}
```

## Pagination

List endpoints return paginated results. See the [Pagination guide](/api-reference/pagination/) for details on how to navigate through paginated responses.

## Available Resources

The API provides the following main resources:

| Resource | Description |
|----------|-------------|
| [Sites](/api-reference/endpoints/sites/) | Manage WordPress sites |
| [Backups](/api-reference/endpoints/backups/) | Create and manage site backups |
| [Deployments](/api-reference/endpoints/deployments/) | Deploy code to your sites |
| [Domains](/api-reference/endpoints/domains/) | Manage domain configurations |
| [SSL Certificates](/api-reference/endpoints/ssl/) | Manage SSL certificates |
| [Users](/api-reference/endpoints/users/) | Manage user access to sites |
| [Environments](/api-reference/endpoints/environments/) | Work with different environments (production, staging, development) |
| [Logs](/api-reference/endpoints/logs/) | Access site logs |
| [Metrics](/api-reference/endpoints/metrics/) | Retrieve performance metrics |

## Rate Limiting

The API implements rate limiting to ensure fair usage. Current limits are:

- 1000 requests per hour per account
- 100 requests per minute per IP address

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1617278400
```

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## Webhooks

The API supports webhooks for real-time notifications about events. See the [Webhooks guide](/api-reference/webhooks/) for details on how to configure and use webhooks.

## SDKs and Client Libraries

We provide official client libraries for several programming languages:

- [Python SDK](https://github.com/wpengine/wpengine-python)
- [Node.js SDK](https://github.com/wpengine/wpengine-node)
- [PHP SDK](https://github.com/wpengine/wpengine-php)
- [Ruby SDK](https://github.com/wpengine/wpengine-ruby)
- [Go SDK](https://github.com/wpengine/wpengine-go)

## API Explorer

You can interactively explore the API using our [API Explorer](/api-reference/explorer/), which provides a graphical interface for making API requests and viewing responses.

## Next Steps

- Learn about [Authentication](/getting-started/authentication/)
- Understand [Pagination](/api-reference/pagination/)
- Explore specific [Endpoints](/api-reference/endpoints/)
- Try the [Quick Start Guide](/getting-started/quick-start/)
