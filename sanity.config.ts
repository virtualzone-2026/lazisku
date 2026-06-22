import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes'; // Menunjuk ke folder skema di dalam folder sanity Anda

export default defineConfig({
  name: 'default',
  title: 'Wasilah Hidayah Studio',

  // Membaca kredensial dari file .env.local yang sudah kita buat sebelumnya
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ID_PROJECT_ANDA_JIKA_BELUM_SET_ENV',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  // Mengunci URL dashboard Studio di rute /studio
  basePath: '/studio',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});