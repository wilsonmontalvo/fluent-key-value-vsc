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
		return {
			root: op,
			left: expTree,
			right: value
		};
	}

	buildExpressionTree(str) {
		if (!str)
			return '';

		var operators = ['(', '[', ',', '>', '*'];
		var closings = [')', ']'];
		var expression = str.split(/(\[|\]|\(|\)|>|,|\*)/g).filter(x => x !== '');
		var partsStack = [];
		var operatorsStack = [];

		// iterate items in expression
		expression.forEach(item => {
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
				if (operators.includes(item))
					operatorsStack.push(item);

				else
					partsStack.push(this.getTreeFor(null, item, null));
			}
		});

		if (partsStack.length > 1) {
			// consume remaining items in stack
			do {
				var right = partsStack.pop();
				var left = partsStack.pop();
				var op = operatorsStack.pop();

				var newNode = this.getTreeFor(left, op, right);
				partsStack.push(newNode);
			} while (operatorsStack.length > 0);
		}

		return partsStack[0];
	}

	evaluateExpression(node, contextOp) {
		if (!node)
			return '';

		let operator = node.root;
		var reservedWords = ['a', 'o'];

		//let resolver = new YamlResolver();
		if (!node.left) { // root of tree.
			if (operator == '(')
				return this.evaluateExpression(node.right, null);
			else if (reservedWords.includes(operator))
				return node.root;
			else
				return this.resolver.resolve(null, null, node.root, contextOp);
		}

		//if (contextOp && (operator == '>' || operator == '[')) contextOp = operator;
		let left = this.evaluateExpression(node.left, null);
		let right = this.evaluateExpression(node.right, node.left.root);

		var result = this.resolver.resolve(left, operator, right, contextOp);

		return result;
	}
}

exports.ExpressionAnalyzer = ExpressionAnalyzer;
