# vscode-helix

Project Helix extension for VS Code.

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/vscode-helix.svg)](https://codecov.io/gh/adobe/vscode-helix)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/vscode-helix.svg)](https://circleci.com/gh/adobe/vscode-helix)
[![GitHub license](https://img.shields.io/github/license/adobe/vscode-helix.svg)](https://github.com/adobe/vscode-helix/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/vscode-helix.svg)](https://github.com/adobe/vscode-helix/issues)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/vscode-helix.svg)](https://greenkeeper.io/)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/vscode-helix.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/vscode-helix)

## Features

* Syntax Coloring for [HTL](https://github.com/adobe/htl-spec/blob/master/SPECIFICATION.md)

**ToDo:**

* Extension tests (syntax coloring, etc.)
* Inject configuration to enable Emmet for HTL
* Code completion for `data-sly-*` attributes.
* Intellisense for `data-sly-*` attributes.
* Intellisense for `*.pre.js` files
* [HTL](https://github.com/adobe/htl-spec/blob/master/SPECIFICATION.md) linter integrated in editor (similar to ESLint)
* ...

**Nice to have:**

* Distinct syntax coloring for [HTL expressions](https://github.com/adobe/htl-spec/blob/master/SPECIFICATION.md#1-expression-language-syntax-and-semantics) (`javascript` syntax coloring is currently applied)
* Theme with distinct coloring of HTL language elements (`sly` tag, `data-sly-*` attributes, expressions)
* ...

## Development

To try the extension:

* Open this project in VS Code.
* Press `F5` to open a new window with the extension loaded.
* Open a `.htl` file in the editor.

See [Extending Visual Studio Code](https://code.visualstudio.com/docs/extensions/overview) for more information on writing VS Code extensions.
