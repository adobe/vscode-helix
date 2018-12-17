/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const fs = require('fs-extra');
const path = require('path');
// eslint-disable-next-line import/no-unresolved
const vscode = require('vscode');

/**
 * Returns a node module installed with VSCode, or null if it fails.
 *
 * @param {string} moduleName
 */
function getCoreNodeModule(moduleName) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
    // eslint-disable-next-line no-empty
  } catch (err) {}

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
    // eslint-disable-next-line no-empty
  } catch (err) {}

  return null;
}

// Require vscode-textmate from vscode itself
const vscodeTM = getCoreNodeModule('vscode-textmate');

const grammarPaths = {
  // TODO: javascript language syntax could be retrieved from vscode.all.extensions
  'source.js': path.resolve(require.main.filename, '../../extensions/javascript/syntaxes/JavaScript.tmLanguage.json'),
  'text.html.htl': path.resolve(__dirname, '../syntaxes/htl.tmLanguage.json'),
};

class Registry {
  constructor() {
    this.grammars = [];
    this.registry = new vscodeTM.Registry({
      loadGrammar: (scopeName) => {
        const grammarPath = grammarPaths[scopeName];
        if (grammarPath) {
          return new Promise((resolve, reject) => {
            fs.readFile(grammarPath, (error, content) => {
              if (error) {
                reject(error);
              } else {
                const rawGrammar = vscodeTM.parseRawGrammar(content.toString(), grammarPath);
                resolve(rawGrammar);
              }
            });
          });
        }
        return null;
      },
    });
  }

  loadGrammar(scopeName) {
    const grammar = this.grammars[scopeName];
    if (grammar) {
      return Promise.resolve(grammar);
    }
    return new Promise((resolve, reject) => {
      this.registry.loadGrammar(scopeName).then((g) => {
        resolve(this.grammars[scopeName] = g);
      }).catch(error => reject(error));
    });
  }
}

exports.Registry = Registry;
