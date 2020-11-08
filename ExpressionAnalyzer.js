const { Node } = require("./Node");

class ExpressionAnalyzer {
	constructor(resolver) {
		this.resolver = resolver;
	}

	analyze(snipShortcut) {
		let expTree = this.buildExpressionTree(snipShortcut);
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
		// return {
		// 	root: op,
		// 	left: expTree,
		// 	right: value
		// };

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
		var reservedWords = ['a', 'o'];

		if (node.isLeafe()) {
			//if (reservedWords.includes(operator))
			// 	return node.root;
			// else 
			return this.resolver.resolve(null, null, node.root, node.parent)
		}
		else  
		if (!node.left) {
			if (operator == '(')
				return this.evaluateExpression(node.right, null);
			else //if (operator == '*')
				return this.resolver.resolve(null, node.root, node.right.root, node.parent);
			//else ;
			// else if (reservedWords.includes(operator))
			// 	return node.root;
			// else
			// 	return this.resolver.resolve(null, null, node.root, contextOp);
		}
		else if (node.left.isLeafe() && node.right.isLeafe()) {
			return this.resolver.resolve(node.left.root, operator, node.right.root, node.parent);
		}
		else {
			let left = '';
			let right = '';
			
			//left = this.evaluateExpression(node.left, null);
			if(node.left.isLeafe())
				left = node.left.root;
			else
				left = this.evaluateExpression(node.left, node.parent);
			
			if(node.right.isLeafe())
				right = node.right.root;
			else
				right = this.evaluateExpression(node.right, node.parent);
			
			var result = this.resolver.resolve(left, operator, right, node.parent);

			return result;
		}
		//if (contextOp && (operator == '>' || operator == '[')) contextOp = operator;
	}
}

exports.ExpressionAnalyzer = ExpressionAnalyzer;
