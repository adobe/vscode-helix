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

const Ajv = require('ajv');
// eslint-disable-next-line import/no-unresolved
const vscode = require('vscode');

class ExpressionCompletionItemProvider {
  constructor(state, documents) {
    this.state = state;
    this.documents = documents;

    this.loadSchemas();
  }

  /**
   * Load all schemas from the helix-pipeline
   *
   * TODO: we shouldn't use the _schema property, and actually we don't need
   *       the validation of Ajv at all: probably better load the JSON
   *       ourselves
   */
  loadSchemas() {
    const schemadir = '@adobe/helix-pipeline/src/schemas';
    const ajv = new Ajv(Object.assign({ allErrors: true, verbose: true }, {}));
    // compromise: in order to avoid async code here
    // (which would complicate pipeline implementation considerably)
    // we're using static file names and synchronous reads/requires (#134)
    const schemaFiles = [
      `${schemadir}/content.schema.json`,
      `${schemadir}/context.schema.json`,
      `${schemadir}/mdast.schema.json`,
      `${schemadir}/meta.schema.json`,
      `${schemadir}/position.schema.json`,
      `${schemadir}/rawrequest.schema.json`,
      `${schemadir}/request.schema.json`,
      `${schemadir}/response.schema.json`,
      `${schemadir}/section.schema.json`,
      `${schemadir}/textcoordinates.schema.json`,
    ];
    schemaFiles.forEach((schemaFile) => {
      /* eslint-disable global-require */
      /* eslint-disable import/no-dynamic-require */
      const schemaData = require(schemaFile);
      ajv.addSchema(schemaData);
    });
    this.ajv = ajv;
    // eslint-disable-next-line no-underscore-dangle
    this.rootSchema = this.ajv._schemas['https://ns.adobe.com/helix/pipeline/context'].schema;
  }

  /**
   * Derefence a node, i.e. look whether it has a $ref property and follow that
   * redirection.
   *
   * @param {object} node, may be null
   */
  deref(node) {
    if (!node || !node.$ref) {
      return node;
    }
    let ref = node.$ref;
    let subpath;
    if (ref.indexOf('#') !== -1) {
      [ref, subpath] = ref.split('#');
    }
    // eslint-disable-next-line no-underscore-dangle
    let targetNode = this.ajv._schemas[ref].schema;
    if (subpath) {
      targetNode = subpath.substr(1).split('/').reduce((n, s) => {
        if (n && n[s]) {
          return n[s];
        }
        return undefined;
      }, targetNode);
    }
    return targetNode;
  }

  /**
   * Given a path made up of dot separated segments, starting from
   * the root context, follow down the path to the target node
   *
   * @param {string} path
   */
  traverse(path) {
    let current = this.rootSchema;
    if (path) {
      current = path.split('.').reduce((n, s) => {
        const n2 = this.deref(n);
        if (n2.properties && n2.properties[s]) {
          return n2.properties[s];
        }
        return null;
      }, current);
    }
    return this.deref(current);
  }

  /**
   * Return the completion items for an expression
   *
   * @param {string} expression expression e.g. "content"
   */
  getCompletionItems(expression) {
    const node = this.traverse(expression);
    const result = [];

    if (node && node.type === 'object') {
      Object.keys(node.properties).forEach((name) => {
        const property = this.deref(node.properties[name]);
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
        item.detail = property.description;
        result.push(item);
      });
    }
    return result;
  }

  /**
   * Callback invoked by VS code when we need to provide completion items.
   *
   * @param {object} document current document
   */
  provideCompletionItems(document, position, token, context) {
    if (context.triggerCharacter !== '.' && context.triggerCharacter !== '{') {
      return [];
    }
    const lineText = document.lineAt(position.line).text;
    const lineTillCurrentPosition = lineText.substr(0, position.character);

    const { scopes } = this.getScopeAt(document, position);
    if (scopes && scopes.length > 1 && scopes[1] === 'meta.support.other.htl') {
      const index = lineTillCurrentPosition.lastIndexOf('{');
      if (index !== -1) {
        const expression = lineTillCurrentPosition.slice(index + 1, -1).trim();
        return this.getCompletionItems(expression);
      }
    }
    return [];
  }

  // eslint-disable-next-line class-methods-use-this
  dispose() {
  }

  getScopeAt(vsdoc, position) {
    const document = this.documents.get(vsdoc.uri);
    if (document) {
      return document.getScopeAt(position);
    }
    return null;
  }
}

exports.ExpressionCompletionItemProvider = ExpressionCompletionItemProvider;
