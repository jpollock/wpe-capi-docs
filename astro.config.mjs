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
                  label: 'Guides',
                  autogenerate: { directory: 'guides' },
              },
              {
                  label: 'Examples',
                  autogenerate: { directory: 'examples' },
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