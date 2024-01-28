import type { SolidMarkedPluginOptions } from 'unplugin-solid-marked';
import solidMarkedUnplugin from 'unplugin-solid-marked';
import type { Plugin } from 'vite';

export type { SolidMarkedPluginOptions } from 'unplugin-solid-marked';

const solidMarkedPlugin = solidMarkedUnplugin.vite as (
  options: SolidMarkedPluginOptions,
) => Plugin;

export default solidMarkedPlugin;
