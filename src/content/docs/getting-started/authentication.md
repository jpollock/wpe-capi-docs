---
title: Authentication
description: Learn how to authenticate with the WP Engine Customer API
---

# Authentication

The WP Engine Customer API uses Basic Authentication, a simple and secure way to authenticate your API requests. This guide will help you get started with authentication quickly.

## Getting Your Credentials

1. Log in to the [WP Engine User Portal](https://my.wpengine.com)
2. Navigate to API Access in the left sidebar
3. Click "Generate Credentials" if you don't have any
4. Copy your API username and password

Keep these credentials secure as they provide access to your WP Engine resources.

## Making Your First API Request

Here's a simple example using cURL to test your credentials:

```bash
curl -X GET "https://api.wpengineapi.com/v1/sites" \
  -u "YOUR_API_USERNAME:YOUR_API_PASSWORD"
```

Replace `YOUR_API_USERNAME` and `YOUR_API_PASSWORD` with the credentials you obtained from the User Portal.

## Next Steps

For more detailed information about authentication, including:
- Code examples in different programming languages
- Security best practices
- Troubleshooting guide
- Environment setup examples

See the [API Authentication Reference](/api-reference/authentication/).
