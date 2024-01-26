/**
 * vite plugin
 */

import type { PluginOption } from 'vite';
import legacyPlugin from './legacy';
import react from '@vitejs/plugin-react';

export function createVitePlugins(viteEnv: string, isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    react({
      babel: {
        babelrc: true,
      },
    }),
  ];

  vitePlugins.push(legacyPlugin());
  return vitePlugins;
}
