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
                  ],
              },
              {
                  label: 'Try!',
                  items: [
                      { label: 'API Playground', slug: 'try/playground' },
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
