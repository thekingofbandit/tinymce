/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

export const enum PluginType {
  Premium = 'premium',
  OpenSource = 'opensource'
}

interface PartialPluginUrl {
  readonly key: string;
  readonly name: string;
  readonly type?: PluginType;
  readonly slug?: string;
}

export interface PluginUrl extends PartialPluginUrl {
  readonly type: PluginType;
  readonly slug: string;
}

const urls = Arr.map<PartialPluginUrl, PluginUrl>([
  { key: 'advlist', name: 'Advanced List' },
  { key: 'anchor', name: 'Anchor' },
  { key: 'autolink', name: 'Autolink' },
  { key: 'autoresize', name: 'Autoresize' },
  { key: 'autosave', name: 'Autosave' },
  { key: 'charmap', name: 'Character Map' },
  { key: 'code', name: 'Code' },
  { key: 'codesample', name: 'Code Sample' },
  { key: 'colorpicker', name: 'Color Picker' },
  { key: 'directionality', name: 'Directionality' },
  { key: 'emoticons', name: 'Emoticons' },
  { key: 'fullscreen', name: 'Full Screen' },
  { key: 'help', name: 'Help' },
  { key: 'image', name: 'Image' },
  { key: 'importcss', name: 'Import CSS' },
  { key: 'insertdatetime', name: 'Insert Date/Time' },
  { key: 'link', name: 'Link' },
  { key: 'lists', name: 'Lists' },
  { key: 'media', name: 'Media' },
  { key: 'nonbreaking', name: 'Nonbreaking' },
  { key: 'pagebreak', name: 'Page Break' },
  { key: 'paste', name: 'Paste' },
  { key: 'preview', name: 'Preview' },
  { key: 'quickbars', name: 'Quick Toolbars' },
  { key: 'save', name: 'Save' },
  { key: 'searchreplace', name: 'Search and Replace' },
  { key: 'table', name: 'Table' },
  { key: 'template', name: 'Template' },
  { key: 'textcolor', name: 'Text Color' },
  { key: 'visualblocks', name: 'Visual Blocks' },
  { key: 'visualchars', name: 'Visual Characters' },
  { key: 'wordcount', name: 'Word Count' },
  // TODO: Add other premium plugins when they are included in the website
  { key: 'a11ychecker', name: 'Accessibility Checker', type: PluginType.Premium },
  { key: 'advcode', name: 'Advanced Code Editor', type: PluginType.Premium },
  { key: 'advtable', name: 'Advanced Tables', type: PluginType.Premium },
  { key: 'autocorrect', name: 'Autocorrect', type: PluginType.Premium },
  { key: 'casechange', name: 'Case Change', type: PluginType.Premium },
  { key: 'checklist', name: 'Checklist', type: PluginType.Premium },
  { key: 'editimage', name: 'Edit Image', type: PluginType.Premium },
  { key: 'export', name: 'Export', type: PluginType.Premium },
  { key: 'mediaembed', name: 'Enhanced Media Embed', type: PluginType.Premium },
  { key: 'formatpainter', name: 'Format Painter', type: PluginType.Premium },
  { key: 'linkchecker', name: 'Link Checker', type: PluginType.Premium },
  { key: 'mentions', name: 'Mentions', type: PluginType.Premium },
  { key: 'pageembed', name: 'Page Embed', type: PluginType.Premium },
  { key: 'permanentpen', name: 'Permanent Pen', type: PluginType.Premium },
  { key: 'powerpaste', name: 'PowerPaste', type: PluginType.Premium },
  { key: 'rtc', name: 'Real-Time Collaboration', type: PluginType.Premium },
  { key: 'tinymcespellchecker', name: 'Spell Checker Pro', type: PluginType.Premium },
  { key: 'tinycomments', name: 'Tiny Comments', type: PluginType.Premium, slug: 'comments' },
  { key: 'tinydrive', name: 'Tiny Drive', type: PluginType.Premium },
  { key: 'tableofcontents', name: 'Table of Contents', type: PluginType.Premium },
], (item) => ({
  ...item,
  // Set the defaults/fallbacks for the plugin urls
  type: item.type || PluginType.OpenSource,
  slug: item.slug || item.key
}));

export {
  urls
};
