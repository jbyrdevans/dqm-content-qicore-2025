const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('executeCqlAll.run', async () => {
    const workspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
    if (!workspace) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    // Find .cql files under input/cql
    const pattern = new vscode.RelativePattern(workspace, 'input/cql/**/*.cql');
    const uris = await vscode.workspace.findFiles(pattern);
    if (!uris.length) {
      vscode.window.showInformationMessage('No .cql files found under input/cql');
      return;
    }

    // Discover commands that look like CQL execution commands
    const allCommands = await vscode.commands.getCommands(true);
    const candidateCommands = allCommands.filter(c => /cql/i.test(c) && /(execute|exec|run)/i.test(c));

    let commandToRun;
    if (candidateCommands.length === 0) {
      // If none found, offer a filtered list of commands that mention 'cql'
      const commandsWithCql = allCommands.filter(c => /cql/i.test(c));
      if (!commandsWithCql.length) {
        vscode.window.showErrorMessage('No installed commands found that look like a CQL executor. Please install the Clinical Quality Language extension or run this from the Extension Development Host where the extension is available.');
        return;
      }
      const pick = await vscode.window.showQuickPick(commandsWithCql, {placeHolder: 'Select a command to invoke for each CQL file'});
      if (!pick) { return; }
      commandToRun = pick;
    } else if (candidateCommands.length === 1) {
      commandToRun = candidateCommands[0];
    } else {
      const pick = await vscode.window.showQuickPick(candidateCommands, {placeHolder: 'Multiple possible CQL execute commands found; pick one to run for each file'});
      if (!pick) { return; }
      commandToRun = pick;
    }

    await vscode.window.withProgress({location: vscode.ProgressLocation.Notification, title: 'Executing CQL files', cancellable: false}, async (progress) => {
      let i = 0;
      for (const uri of uris) {
        i++;
        progress.report({message: `${i}/${uris.length}: ${uri.path.split('/').pop()}`});
        // Try multiple argument shapes to match various extension expectations.
        // For the specific Clinical Quality Language command `cql.action.executeCql`
        // try a broader set of argument structures observed in VS Code extensions.
        const tryArgs = [
          uri,
          { fsPath: uri.fsPath },
          uri.fsPath,
          { resourceUri: uri },
          uri.toString(),
          { path: uri.fsPath },
          [uri],
          [uri.fsPath],
          { uris: [uri] },
          { uris: [uri.fsPath] },
          { document: uri },
          { documentUri: uri },
          { file: uri },
          { filePath: uri.fsPath }
        ];

        let executed = false;
        for (const arg of tryArgs) {
          try {
            await vscode.commands.executeCommand(commandToRun, arg);
            executed = true;
            break;
          } catch (err) {
            // continue trying next shape
            console.debug('Attempt to execute', commandToRun, 'with arg', arg, 'failed:', err && err.message ? err.message : err);
          }
        }

        if (!executed) {
          // If nothing worked, show a descriptive error
          console.error('All attempts to call', commandToRun, 'for', uri.fsPath, 'failed');
          vscode.window.showErrorMessage(`Failed to execute ${commandToRun} for ${uri.fsPath}. Tried multiple argument shapes (Uri, {fsPath}, path string, arrays, and wrapper objects).`);
        }
        // small delay to avoid overwhelming the extension
        await new Promise(r => setTimeout(r, 150));
      }
    });

    vscode.window.showInformationMessage(`Done: executed ${uris.length} CQL files using command ${commandToRun}`);
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
