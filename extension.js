// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { ExpressionAnalyzer } = require("./ExpressionAnalyzer");
const { JsonResolver } = require("./JsonResolver");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "fluent-key-value" is now active!');

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

					let resolver = new JsonResolver();
					let analyzer = new ExpressionAnalyzer(resolver);
					let snippetResult = analyzer.analyze(snipShortcut);

					editor.edit(editBuilder => {
						editBuilder.replace(selection, '');
					}).then(() => {
						var position = vscode.window.activeTextEditor.selection.end; 
						//vscode.window.activeTextEditor.selection = new vscode.Selection(position, position);
						vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(snippetResult), position);
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
