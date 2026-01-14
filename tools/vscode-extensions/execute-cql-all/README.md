Execute CQL All
=================

This small VS Code extension finds all `.cql` files under `input/cql` in the workspace and invokes an installed command that looks like a CQL "Execute" action for each file.

Usage
-----

1. Open this workspace in VS Code.
2. From the Command Palette run `Execute CQL: Run on input/cql files`.
3. The extension will try to discover installed commands whose identifiers contain `cql` and `execute|exec|run`. If multiple are found you'll be prompted to choose one. If none are found you'll be shown a list of commands containing `cql`.

Notes
-----

- This extension discovers and invokes commands from other installed extensions; it does not itself implement CQL interpretation.
- Run it in an Extension Development Host (F5) or package & install with `vsce`.
