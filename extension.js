// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fluent-key-value" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fluent-key-value.create', function () {
		let options = {};
		if (vscode.window.activeTextEditor.selection.isEmpty) {
			options = { prompt: "Enter snippet's shortcut", placeHolder: "e.g: ob>1" }
		}
		else {
			var selectedText = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
			options = { prompt: "Enter snippet's shortcut", placeHolder: "e.g: ob>1", value: selectedText }
		}
		
		vscode.window.showInputBox(options)
			.then((snipShortcut) => {
				const editor = vscode.window.activeTextEditor;
				if (editor) {
					const selection = editor.selection;

					// TODO: Parse text
					let result = parseText(snipShortcut);
					//if(!result.success) vscode.window.showWarningMessage('Unable to parse shortcut!');
					if(snipShortcut && !result.success) vscode.window.showInformationMessage('Sorry, this command is not supported yet.');

					// TODO: Get Language Provider
					// TODO: Get snippet

					editor.edit(editBuilder => {
						editBuilder.replace(selection, '');
					}).then(() => {
						var position = vscode.window.activeTextEditor.selection.end; 
						//vscode.window.activeTextEditor.selection = new vscode.Selection(position, position);
						vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(result.snippet), position);
					});
				}
			});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

function parseText(str) {
	let parseResult = {
		'snippet': '',
		'success': true
	};

	if(str == 'ob>1'){
		parseResult.snippet = '{\n\t\"${1:<key>}\": ${2:<value>}\n}$0';
		return parseResult;
	}
	
	// if(str == 'ar'){
	// 	parseResult.snippet = '[\n\t$0\n]';
	// 	return parseResult;
	// }

	// if(str == 'pa'){
	// 	parseResult.snippet = '\"${1:<key>}\": $0';
	// 	return parseResult;
	// }
	
	parseResult.snippet = str;
	parseResult.success = false;
    return parseResult;
}