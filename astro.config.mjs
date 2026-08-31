import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://cae-west.github.io',
  base: '/svelte-docs',
  integrations: [
    starlight({
      title: 'Svelte Documentation',
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/getting-started/introduction/' },
            { label: 'Creating a Project', link: '/getting-started/creating-a-project/' },
            { label: 'Project Structure', link: '/getting-started/project-structure/' },
            { label: 'Basic Routing', link: '/getting-started/basic-routing/' },
            { label: 'Building Your App', link: '/getting-started/building-your-app/' },
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            { label: 'Routing', link: '/core-concepts/routing/' },
            { label: 'Loading Data', link: '/core-concepts/loading-data/' },
            { label: 'Form Actions', link: '/core-concepts/form-actions/' },
            { label: 'Page Options', link: '/core-concepts/page-options/' },
            { label: 'State Management', link: '/core-concepts/state-management/' },
          ],
        },
        {
          label: 'Build and Deploy',
          items: [
            { label: 'Building Your App', link: '/build-and-deploy/building-your-app/' },
            { label: 'Adapters', link: '/build-and-deploy/adapters/' },
            { label: 'Zero-Config Deployments', link: '/build-and-deploy/zero-config-deployments/' },
            { label: 'Static Site Generation', link: '/build-and-deploy/static-site-generation/' },
            { label: 'Node Servers', link: '/build-and-deploy/node-servers/' },
          ],
        },
        {
          label: 'Advanced',
          items: [
            { label: 'Advanced Routing', link: '/advanced/advanced-routing/' },
            { label: 'Hooks', link: '/advanced/hooks/' },
            { label: 'Errors', link: '/advanced/errors/' },
            { label: 'Link Options', link: '/advanced/link-options/' },
            { label: 'Server-Only Modules', link: '/advanced/server-only-modules/' },
          ],
        },
        {
          label: 'Appendix',
          items: [
            { label: 'FAQ', link: '/appendix/frequently-asked-questions/' },
            { label: 'Integrations', link: '/appendix/integrations/' },
            { label: 'Migrating to v2', link: '/appendix/migrating-to-v2/' },
            { label: 'Additional Resources', link: '/appendix/additional-resources/' },
            { label: 'Glossary', link: '/appendix/glossary/' },
            { label: 'Audit Report', link: '/appendix/audit-report/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Configuration', link: '/reference/configuration/' },
            { label: 'CLI', link: '/reference/command-line-interface/' },
            { label: 'Types', link: '/reference/types/' },
            { label: 'Modules', link: '/reference/modules/' },
            { label: 'Web Standards', link: '/reference/web-standards/' },
          ],
        },
      ],
    }),
  ],
});
