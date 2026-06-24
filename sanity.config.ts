// sanity.config.ts
import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import React from 'react';
import { schemaTypes } from './sanity/schemaTypes';

// Menyesuaikan tema warna UI internal Sanity dengan hijau emerald segar
const emeraldTheme = buildLegacyTheme({
  '--black': '#1f2937',
  '--white': '#ffffff',
  '--brand-primary': '#10b981', 
  '--component-bg': '#ffffff',
  '--component-text-color': '#1f2937',
  '--focus-color': '#fbbf24',
});

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

  theme: emeraldTheme,

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
                // Menggunakan warna hijau terang yang tipis/soft agar logo kontras
                background: '#e6f7f0', 
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #c2ebd9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }
            },
            // 🚀 LOGO DIBIKIN BESAR DAN BERDIRI SENDIRI TANPA TEKS TAMBAHAN
            React.createElement('img', {
              src: '/images/logo-mengaji.png',
              alt: 'Logo Indonesia Mengaji',
              style: {
                height: '52px', // Ukuran diperbesar signifikan agar detail teks di gambar terbaca
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }
            })
          ),
          props.renderDefault(props)
        );
      },
    },
  },
});