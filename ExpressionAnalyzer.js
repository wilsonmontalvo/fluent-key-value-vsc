const { Node } = require("./Node");

class ExpressionAnalyzer {
	constructor(resolver) {
		this.resolver = resolver;
	}

	analyze(snipShortcut) {
		let expTree = this.buildExpressionTree(snipShortcut);
		this.setNodesDepth(expTree, null, 0);
		let result = this.evaluateExpression(expTree, null);

		return result;
	}

	getOpeningOperator(item) {
		if (item == ')')
			return '(';
		if (item == ']')
			return '[';
		return null;
	}

	getTreeFor(expTree, op, value) {
		return new Node(expTree, op, value)
	}

	// Algorithm references:
	// https://www.studytonight.com/post/arithmetic-expressioninfix-evaluation-using-stack
	// https://algorithms.tutorialhorizon.com/evaluation-of-infix-expressions/
	buildExpressionTree(str) {
		if (!str)
			return '';

		var operators = ['(', '[', ',', '>', '*'];
		var operatorThatAllowsImplicitOperand = ['*']; // e.g: "*2" has an implicit "null" left operand.
		var closings = [')', ']'];
		var expression = str.split(/(\[|\]|\(|\)|>|,|\*)/g).filter(x => x !== '');
		var partsStack = []; // Contains input elements, but also Nodes when building the Tree. So, final item is a Node.
		var operatorsStack = []; // Contains operators from the input

		// iterate items in expression
		for (let i = 0; i < expression.length; i++) {
			const item = expression[i];
			
			if (closings.includes(item)) {
				var operatorOpening = this.getOpeningOperator(item);

				do {
					var right = partsStack.pop();
					var left = partsStack.pop();
					var op = operatorsStack.pop();

					var newNode = this.getTreeFor(left, op, right);
					partsStack.push(newNode);

					if (operatorsStack.length > 0 && operatorsStack[operatorsStack.length - 1] == '(')
						op = operatorsStack.pop();
				} while (op !== operatorOpening);
			}
			else {
				if (operators.includes(item)) {
					operatorsStack.push(item);
					if(operatorThatAllowsImplicitOperand.includes(item) && i > 0 && operators.includes(expression[i-1])) // Operator needs an implicit empty value.
						partsStack.push(this.getTreeFor(null, null, null)); // Add implicit "null" operand
				}
				else
					partsStack.push(this.getTreeFor(null, item, null));
			}
		}

		// Apply remaining operations in stack (typically when not grouping items - not using "(..)" )
		while (operatorsStack.length > 0) {
			var right = partsStack.pop();
			var left = partsStack.pop();
			var op = operatorsStack.pop();

			var newNode = this.getTreeFor(left, op, right);
			partsStack.push(newNode);
		} 

		return partsStack[0];
	}

	evaluateExpression(node, contextOp) {
		if (!node)
			return '';

		let operator = node.root;

		if (node.isLeafe()) {
			return this.resolve(null, null, node.root, node, node.parent)
		}
		else  
		if (!node.left) {
			if (operator == '(')
				return this.evaluateExpression(node.right, null);
			else //if (operator == '*')
				return this.resolve(null, node.root, node.right.root, node, node.parent);
		}
		else if (node.left.isLeafe() && node.right.isLeafe()) {
			return this.resolve(node.left.root, operator, node.right.root, node, node.parent);
		}
		else {
			let left = '';
			let right = '';
			
			if(node.left.isLeafe())
				left = node.left.root;
			else
				left = this.evaluateExpression(node.left, node.parent);
			
			if(node.right.isLeafe())
				right = node.right.root;
			else
				right = this.evaluateExpression(node.right, node.parent);
			
			var result = this.resolve(left, operator, right, node, node.parent);

			return result;
		}
	}

	resolve(left, operator, right, node, contextOp) {
		if (!operator) { // It's single item
			if (right == 'o')
				return this.resolver.getObject('', node, node.depth);
			else if (right == 'a')
				return this.resolver.getArray('', node, node.depth);
			else
				return this.resolver.getPair(right, '', node, node.depth);
		}
		else if (operator == '[') { // '[' is only for pairs
			let value = '';
			if (right == 'o')
				value = this.resolver.getObject('', node, node.depth);
			else if (right == 'a')
				value = this.resolver.getArray('', node, node.depth);
			else
				value = right;

			return this.resolver.getPair(left, value, node, node.depth);
		}
		else if (operator == '>') {
			let content = right;

			if (right == 'o') {
				content = this.resolver.getObject('', node.right, node.right.depth)
			}
			else if(right.match(/^[0-9a-zA-Z]+$/)) {
				content = this.getJsonItem(right, node.right.container, node.right.depth);
			}

			if (left == 'o')
				return this.resolver.getObject(content, node, node.depth);
			else if (left == 'a')
				return this.resolver.getArray(content, node, node.depth);
			else 
				return '###'
		}
		else if (operator == ',') {
			let item1 = left;
			let item2 = right;

			if (left == 'o' || left == 'a') {
				item1 = left == 'o' ? this.resolver.getObject('', node, node.depth) 
					: this.resolver.getArray('', node, node.depth);
			}
			else if(left.match(/^[0-9a-zA-Z]+$/)) {
				item1 = this.getJsonItem(left, node.left.container, node.left.depth);
			}

			if (right == 'o' || right == 'a') {
				item2 = right == 'o' ? this.resolver.getObject('', node, node.depth) 
					: this.resolver.getArray('', node, node.depth);
			}
			else if(right.match(/^[0-9a-zA-Z]+$/)) {
				item2 = this.getJsonItem(right, node.right.container, node.right.depth);
			}

			return this.resolver.concatenateItems(item1, item2);
		}
		else if (operator == '*') {
			let repetitions = parseInt(right);
			if (!left)
				left = this.resolver.getPair('', '', node, node.depth);
			else if (left == 'o')
				left = this.resolver.getObject('', node, node.depth);

			return this.resolver.multiplyItem(left, repetitions, node, 0);
		}

		return this.resolver.getItem(right, node);
	}

	getJsonItem(value, container, depth) {
		let result = '';
		if (container == 'array')
			result = this.resolver.getValueItem(value, depth);
		else //if (container == 'object')
			result = this.resolver.getPair(value, '', null, depth);
		// else
		// 	result = '#';

		return result;
	}

	setNodesDepth(node, contextOp, currentDepth, container) {
		node.depth = currentDepth;
		node.container = container;

		if(node.isLeafe()) {
			return;
		}
		
		var depthOperators = ['>'];

		if (depthOperators.includes(node.root)) {
			currentDepth++;

			if (node.left.root === 'a')
				container = 'array';
			else if (node.left.root === 'o')
				container = 'object';
		}

		if (node.root == '[')
			container = 'pair';

		if (node.left) this.setNodesDepth(node.left, node, currentDepth, container);
		if (node.right) this.setNodesDepth(node.right, node, currentDepth, container);
	}
}

exports.ExpressionAnalyzer = ExpressionAnalyzer;
