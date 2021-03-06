# Changelog

All notable changes to the vscode-dasm extension are listed here. For a more complete list, check the [release list in the GitHub repository](https://github.com/zeh/vscode-dasm/releases).

## 2.0.1 - 2017-02-04

### Added

* Multi-file support: `include` files (e.g. "vcs.h") are properly added to the compilation bundle
* Navigate/peek definitions now support included files
* Auto-completion for instructions, pseudo-ops, symbols, and labels

## 1.3.0 - 2017-01-24

### Added

* Hover feature now shows definitions for all 6502 instructions and dasm pseudo-ops
* Added ability to navigate/peek definitions (same file only)

### Changed

* Performance improvements: the main server module manages source lines splitting, instead of each individual feature provider
* Marketplace page updates

## 1.2.0 - 2017-01-21

### Added

* Basic symbol/label hover support

### Minor

* Marketplace page updates

## 1.1.3 - 2017-01-21

### Minor

* Marketplace page updates

## 1.1.2 - 2017-01-21

### Minor

* Marketplace page updates

## 1.1.1 - 2017-01-21

### Minor

* Marketplace page updates

## 1.1.0 - 2017-01-21

### Minor

* Merged extension and language server repositories
* Marketplace page updates

## 1.0.2 - 2017-01-14

### Minor

* Marketplace page updates

## 1.0.1 - 2017-01-14

### Minor

* Marketplace page updates

## 1.0.0 - 2017-01-14 - Initial release

### Added

* Basic Syntax highlight
* Inline error detection as you type
