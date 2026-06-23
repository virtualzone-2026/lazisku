// sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import React from 'react'; // 🚀 Pastikan React di-import
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'Indonesia Mengaji',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ID_PROJECT_ANDA',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },

  // 🚀 TAMPILAN PREMIUM BEBAS EROR PARSING TSX
  studio: {
    components: {
      navbar: (props) => {
        return React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column' } },
          React.createElement(
            'div',
            {
              style: {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #064e3b',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                gap: '10px'
              }
            },
            React.createElement('span', { style: { fontSize: '20px' } }, '💚'),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h1',
                { style: { margin: 0, fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' } },
                'Yayasan Generasi Indonesia Mengaji'
              ),
              React.createElement(
                'p',
                { style: { margin: 0, fontSize: '10px', color: '#a7f3d0', fontWeight: 600 } },
                'DASHBOARD MANAJEMEN UTAMA'
              )
            )
          ),
          props.renderDefault(props)
        );
      },
    },
  },

  theme: {
    '--black': '#1f2937',
    '--white': '#ffffff',
    '--brand-primary': '#059669',
    '--component-bg': '#ffffff',
    '--component-text-color': '#1f2937',
    '--focus-color': '#fbbf24',
  }
});