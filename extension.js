// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { ExpressionAnalyzer } = require("./ExpressionAnalyzer");
const { JsonResolver } = require("./JsonResolver");
const { YamlResolver } = require('./YamlResolver');

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
	let cmdCreateJson = vscode.commands.registerCommand('fluent-key-value.createJson', function () {
		let options = getPromtOptions();
		vscode.window.showInputBox(options)
			.then((snipShortcut) => {
				if (snipShortcut)
					createSnippet(snipShortcut, new JsonResolver());
			});
	});
	
	let cmdCreateYaml = vscode.commands.registerCommand('fluent-key-value.createYaml', function () {
		let options = getPromtOptions();
		vscode.window.showInputBox(options)
			.then((snipShortcut) => {
				if (snipShortcut)
					createSnippet(snipShortcut, new YamlResolver());
			});
	});

	context.subscriptions.push(cmdCreateJson);
	context.subscriptions.push(cmdCreateYaml);
}

function getPromtOptions() {
	if (vscode.window.activeTextEditor.selection.isEmpty) {
		return { prompt: "Enter snippet's shortcut", placeHolder: "e.g: o>image[nginx]" }
	}
	else {
		var selectedText = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
		return { prompt: "Enter snippet's shortcut", value: selectedText }
	}
}

function createSnippet(snipShortcut, resolver) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
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
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
