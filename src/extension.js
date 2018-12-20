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
const vscode = require('vscode');

const { Documents } = require('./documents.js');
const { ExpressionCompletionItemProvider } = require('./suggest.js');

const HTL_SCRIPT_MODE = { scheme: 'file', language: 'htl' };

// called when extension is activated
function activate(context) {
  const documents = new Documents();
  context.subscriptions.push(documents);
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(documents.open));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(documents.close));
  documents.reload();

  const provider = new ExpressionCompletionItemProvider(context.globalState, documents);
  context.subscriptions.push(provider);
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTL_SCRIPT_MODE, provider, '.', '{'));
}

exports.activate = activate;

// called when extension is deactivated
function deactivate() {
  // TODO: clean-up
}

exports.deactivate = deactivate;
