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

function getOpeningOperator(item) {
	if (item == ')') return '(';
	if (item == ']') return '[';
	return null;
}

function getTreeFor(expTree, op, value) {
	return {
		root : op,
		left : expTree,
		right: value
	};
}

function buildExpressionTree(str){
	if(!str) return '';

	var operators = ['(', '[', ',', '>', '*'];
	var closings = [')', ']']
	var expression = str.split(/(\[|\]|\(|\)|>|,|\*)/g).filter(x => x !== '');
	var partsStack = [];
	var operatorsStack = [];

	// iterate items in expression
	expression.forEach(item => {
		if (closings.includes(item)) {
			var operatorOpening = getOpeningOperator(item);

			do {
				var right = partsStack.pop();
				var left = partsStack.pop();
				var op = operatorsStack.pop();
				
				var newNode = getTreeFor(left, op, right);
				partsStack.push(newNode);

				if(operatorsStack.length > 0 && operatorsStack[operatorsStack.length - 1] == '(')
					op = operatorsStack.pop();
			} while (op !== operatorOpening)
		}
		else {
			if(operators.includes(item))
				operatorsStack.push(item);
			else
				partsStack.push(getTreeFor(null, item, null));
		}
	});

	if(partsStack.length > 1) {
		// consume remaining items in stacks
		do {
			var right = partsStack.pop();
			var left = partsStack.pop();
			var op = operatorsStack.pop();
			
			var newNode = getTreeFor(left, op, right);
			partsStack.push(newNode);
		} while (operatorsStack.length > 0)
	}

	return partsStack[0];
}

class KeyValueOperator {
  constructor(prefix, value, sufix) {
    this.prefix = prefix;
    this.value = value;
    this.sufix = sufix;
  }
}

class KeyValueResolver {
  getKeyValuePrefix(key) { return 'N/A'; }
	getOperator(opId, container) { return new KeyValueOperator('', 'N/A', ''); }
}

class JsonResolver extends KeyValueResolver {
  getKeyValuePrefix(key) { 
		return '"' + key + '": ';
	}

	getOperator(opId, container) { 
		if(opId = '>') {
			if(container == 'o') return new KeyValueOperator('{\n\t', '>', '\n}');
			if(container == 'a') return new KeyValueOperator('[\n\t', '>', '\n]');
		}
		else if(opId = '[') return new KeyValueOperator('[\n\t', '[', '\n]');
		else if(opId = ',') return new KeyValueOperator('', ',\n', '');
		return new KeyValueOperator('', 'N/A', '');
	}

	resolve(left, operator, right, contextOp) {
		let isObject = left == 'o';
		let isArray = left == 'a';
	
		if (operator == '[') {
			return left + ': ' + right;
		}
		else if (operator == '>') {
			if (isObject) return '{\n\t' + right + '\n}';
			if (isArray) return '[\n\t' + right + '\n]';
		}
		else if (operator == ',') {
			let item1 = left;
			let item2 = right;
			if (item1.match(/^[0-9a-zA-Z]+$/)) item1 = getKeyValuePrefix(left);
			if (item2.match(/^[0-9a-zA-Z]+$/)) item2 = getKeyValuePrefix(right);
			return item1 + ',\n' + item2
		}
		else if (operator == '*') {
			let multiplier = parseInt(right);
			let arr = [];
			for (let index = 0; index < multiplier; index++) {
				arr.push(left);
			}
	
			return arr.join();
		}
	
		return '';
	}
}

class YamlResolver extends KeyValueResolver {
  getKeyValuePrefix(key) { 
		return key + ': ';
	}

	getPair(key, value) {
		return key + ': ' + value;
	}
	
	getItem(item, contextOp) {
		if(contextOp == 'o') return new KeyValueOperator('\n\t', contextOp, '');
		else if(contextOp == 'a') return new KeyValueOperator('\n- ', contextOp, '');
	}

	getOperator(opId, container) { 
		if(opId = '>') {
			if(container == 'o') return new KeyValueOperator('\n\t', opId, '');
			if(container == 'a') return new KeyValueOperator('\n- ', opId, '');
		}
		else if(opId = '[') return new KeyValueOperator('', '[', '');
		else if(opId = ',') return new KeyValueOperator('', '\n', '');
		else if(opId = '*') return new KeyValueOperator('', '', '');
		return new KeyValueOperator('', 'N/A', '');
	}

	resolve(left, operator, right, contextOp) {
		let isObject = left == 'o';
		let isArray = left == 'a';
	
		if (operator == '[') { // '[' is only for pairs
			return left + ': '+ right;
		}
		else if (operator == '>') {
			if (isObject) return '\n\t' + right + '\n';
			if (isArray) return '\n\t' + right + '\n';
		}
		else if (operator == ',') {
			let item1 = left;
			let item2 = right;
			if (item1.match(/^[0-9a-zA-Z]+$/)) item1 = getKeyValuePrefix(left);
			if (item2.match(/^[0-9a-zA-Z]+$/)) item2 = getKeyValuePrefix(right);

			if(isArray)
				return '- ' + item1 + '\n' + item2
			else
				return item1 + '\n' + item2
		}
		else if (operator == '*') {
			let multiplier = parseInt(right);
			let arr = [];
			for (let index = 0; index < multiplier; index++) {
				arr.push(left);
			}
	
			return arr.join('');
		}
	
		return '';
	}
}

function getKeyValuePrefix(key) {
	return '"' + key + '": ';
}

function resolve(left, operator, right) {
	let isObject = left == 'o';
	let isArray = left == 'a';

	if (operator == '[') {
		return getKeyValuePrefix(left) + right;
	}
	else if (operator == '>') {
		if (isObject) return '{\n\t' + right + '\n}';
		if (isArray) return '[\n\t' + right + '\n]';
	}
	else if (operator == ',') {
		let item1 = left;
		let item2 = right;
		if (item1.match(/^[0-9a-zA-Z]+$/)) item1 = getKeyValuePrefix(left);
		if (item2.match(/^[0-9a-zA-Z]+$/)) item2 = getKeyValuePrefix(right);
		return item1 + ',\n' + item2
	}
	else if (operator == '*') {
		let multiplier = parseInt(right);
		let arr = [];
		for (let index = 0; index < multiplier; index++) {
			arr.push(left);
		}

		return arr.join();
	}

	return '';
}

function evaluateExpression(node, contextOp) {
	if (!node)
		return '';

	let operator = node.root;
	if(!node.left) { // root of tree.
		if(operator == '(') return evaluateExpression(node.right, null);
		else return node.root;
	}

	//if (contextOp && (operator == '>' || operator == '[')) contextOp = operator;

	let left = evaluateExpression(node.left, null);
	let right = evaluateExpression(node.right, node.left);

	 //let resolver = new JsonResolver();
	let resolver = new YamlResolver();
	var result = resolver.resolve(left, operator, right, contextOp);

	return result;
}

function parseText(str) {
	let expTree = buildExpressionTree(str);
	let result = evaluateExpression(expTree, null);

	return {
		'snippet': result,
		'success': true
	};
}
