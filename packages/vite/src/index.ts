import solidMarkedUnplugin, { SolidMarkedPluginOptions } from 'unplugin-solid-marked';
import { Plugin } from 'vite';

export type { SolidMarkedPluginOptions } from 'unplugin-solid-marked';

const solidMarkedPlugin = solidMarkedUnplugin.vite as (options: SolidMarkedPluginOptions) => Plugin;

export default solidMarkedPlugin;
