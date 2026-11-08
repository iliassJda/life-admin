import type { MetadataRoute } from 'next';
import { site } from '@/lib/core/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    id: '/app',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0b0c',
    theme_color: '#0a0b0c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
