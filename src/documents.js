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

// eslint-disable-next-line import/no-unresolved
const vscode = require('vscode'); // eslint-disable-line no-unused-vars
const { Registry } = require('./registry.js');

class Document {
  constructor(vsdoc, grammar) {
    this.vsdoc = vsdoc;
    this.grammar = grammar;
    this.subscriptions = [];
    this.grammarState = [];

    // Parse whole document
    const docRange = new vscode.Range(0, 0, this.vsdoc.lineCount, 0);
    this.reparseTokens(docRange);

    this.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === this.vsdoc) {
        this.onChangeDocument(e);
      }
    }));
  }

  dispose() {
    this.subscriptions.forEach(s => s.dispose());
  }

  reparseTokens(r) {
    const range = this.vsdoc.validateRange(r);

    let invalidatedTokenState = false;

    const { lineCount } = this.vsdoc;
    let lineIdx;
    for (lineIdx = range.start.line;
      lineIdx <= range.end.line || (invalidatedTokenState && lineIdx < lineCount);
      lineIdx += 1) {
      const line = this.vsdoc.lineAt(lineIdx);
      const { invalidated } = this.refreshTokensOnLine(line);
      invalidatedTokenState = invalidated;
    }
  }

  refreshTokensOnLine(line) {
    const prevState = this.grammarState[line.lineNumber - 1] || null;
    const lineTokens = this.grammar.tokenizeLine(line.text, prevState);
    const invalidated = !this.grammarState[line.lineNumber]
      || !lineTokens.ruleStack.equals(this.grammarState[line.lineNumber]);
    this.grammarState[line.lineNumber] = lineTokens.ruleStack;
    return { tokens: lineTokens.tokens, invalidated };
  }

  getScopeAt(p) {
    const position = this.vsdoc.validatePosition(p);
    const state = this.grammarState[position.line - 1] || null;
    const line = this.vsdoc.lineAt(position.line);
    const tokens = this.grammar.tokenizeLine(line.text, state);

    let result;
    tokens.tokens.some((t) => {
      if (t.startIndex <= position.character && position.character < t.endIndex) {
        result = {
          range: new vscode.Range(position.line, t.startIndex, position.line, t.endIndex),
          text: line.text.substring(t.startIndex, t.endIndex),
          scopes: t.scopes,
        };
        return true;
      }
      return false;
    });
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  onChangeDocument(event) {
    // TODO
    event.contentChanges.forEach((change) => {
      const { range } = change;
      // eslint-disable-next-line no-console
      console.log(`changed: ${range.start.line}:${range.start.character}`
        + `-${range.end.line}:${range.end.character}, text: ${change.text}`);
    });
  }

  refresh() {
    this.grammarState = [];
    const docRange = new vscode.Range(0, 0, this.vsdoc.lineCount, 0);
    this.reparseTokens(docRange);
  }
}

class Documents {
  constructor() {
    this.docs = new Map();
    this.registry = new Registry();
  }

  open(vsdoc) {
    const doc = this.docs.get(vsdoc.uri);
    if (doc) {
      doc.refresh();
    } else if (vsdoc.languageId === 'htl') {
      this.registry.loadGrammar('text.html.htl').then((grammar) => {
        this.docs.set(vsdoc.uri, new Document(vsdoc, grammar));
      });
    }
  }

  close(vsdoc) {
    const doc = this.docs.get(vsdoc.uri);
    if (doc) {
      doc.dispose();
      this.docs.delete(doc.uri);
    }
  }

  reload() {
    Array.from(this.docs.values()).forEach(doc => doc.dispose);
    this.docs.clear();

    vscode.workspace.textDocuments.forEach(vsdoc => this.open(vsdoc));
  }

  dispose() {
    Array.from(this.docs.values()).forEach(doc => doc.dispose());
    this.docs.clear();
  }

  get(uri) {
    return this.docs.get(uri);
  }
}

exports.Documents = Documents;
