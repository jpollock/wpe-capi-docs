// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
      starlight({
          title: 'WP Engine Customer API',
          description: 'Documentation for the WP Engine Customer API',
          customCss: [
              // Path to your custom CSS file
              './src/styles/custom.css',
          ],
          social: {
              github: 'https://github.com/wpengine/customer-api',
          },
          sidebar: [
              {
                  label: 'Getting Started',
                  items: [
                      { label: 'Introduction', slug: 'getting-started/introduction' },
                      { label: 'Authentication', slug: 'getting-started/authentication' },
                      { label: 'Quick Start', slug: 'getting-started/quick-start' },
                  ],
              },
              {
                  label: 'API Reference',
                  items: [
                      { label: 'Overview', slug: 'api-reference/overview' },
                      { label: 'Authentication', slug: 'api-reference/authentication' },
                      { label: 'Pagination', slug: 'api-reference/pagination' },
                      { label: 'Endpoints', slug: 'api-reference/endpoints' },
                      { label: 'Playground', slug: 'api-reference/playground' },
                  ],
              },
              {
                  label: 'SDK Examples',
                  items: [
                      { label: 'Basic Usage', slug: 'sdk-examples/basic-usage' },
                      { label: 'Authentication', slug: 'sdk-examples/authentication' },
                      { label: 'Site Management', slug: 'sdk-examples/site-management' },
                      { label: 'Backup Management', slug: 'sdk-examples/backup-management' },
                      { label: 'Error Handling', slug: 'sdk-examples/error-handling' },
                  ],
              },
          ],
          components: {
              // Override built-in components with custom ones
              Head: './src/components/Head.astro',
          },
      }),
	],

  adapter: node({
    mode: 'standalone',
  }),
});
