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

// called when extension is activated
function activate(context) {
  // register commands
  const disposable = vscode.commands.registerCommand('extension.someHelixTask', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No open text editor
    }

    const { selection } = editor;
    const text = editor.document.getText(selection);

    // Display a message box to the user
    vscode.window.showInformationMessage(`Selected characters: ${text.length}`);
    //vscode.window.showInformationMessage('Done Some Helix Task!');
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// called when extension is deactivated
function deactivate() {
  // clean-up
}
exports.deactivate = deactivate;
