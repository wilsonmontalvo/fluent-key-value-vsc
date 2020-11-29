const { KeyValueResolver } = require("./KeyValueResolver");
const { Node } = require("./Node");

class YamlResolver extends KeyValueResolver {
	getItem(key, contextOp) {
		var reservedWords = ['a', 'o'];

		if (!contextOp || reservedWords.includes(contextOp)) { // It's the 'key'
			let prefix = key + ': ';
			// return prefix;
			if (contextOp === 'a')
				return '- ' + prefix;
			else
				return prefix;
		}
		else { // It's the value
			return key;
		}
	}
	
	getValueItem(value, node) {
		let offset = this.getOffset(node.depth);
		offset = offset.substring(0, offset.length - 2) + '- ';

		if (value === 'true' || value === 'false' || value === 'null' || value.match(/^[0-9]+$/))
			return offset + value;
		else // TODO: Merge these 2 returns!
			return offset + value;
	}

	getPair(key, value, contextOp, depth) {
		let offset = this.getOffset(depth);

		if (value === '') {
			return offset + key + ': ';
		}
		else if (value === 'true' || value === 'false' || value === 'null' || value.match(/^[0-9]+$/)) {
			return offset + key + ': ' + value;
		}
		else if (value.match(/^[0-9a-zA-Z]+$/)) { // "Value" is a primitive value
			return offset + key + ': ' + value;
		}
		else { // "Value" is an object value
			return offset + key + ':' + value;
		}
	}

	getObject(pair, contextOp, depth) {
		// if (contextOp.container == 'array')
		// 	depth = depth - 1;
		let offsetEnd = this.getOffset(depth);
		let offsetStart = contextOp && contextOp.container == 'pair' ? '' : offsetEnd; // Remove offset if the object is a pair's value (it's inline).

		if (contextOp.container == 'array')
			offsetStart = offsetStart.substring(0, offsetStart.length - 2) + '- ';
		
		if (pair) {
			if (contextOp.container == 'array') {
				return offsetStart + pair.trimLeft(); // Offset of the Object replaces 1st offset of the pair
			}
			else
				return offsetStart + '\n' + pair;
		}
		else {
			if (contextOp && contextOp.container == 'pair')
				return ' {}';
			else
				return offsetStart + '{}';
		}
		// if (contextOp === 'a')
		// 	return '- ' + pair;
		// else
		// 	return pair;
	}

	getArray(content, contextOp, depth) {
		let offsetEnd = this.getOffset(depth);
		let offsetStart = contextOp && contextOp.container == 'pair' ? '' : offsetEnd; // Remove offset if the array is a pair's value (it's inline).

		if (content)
			return offsetStart + '\n' + content;
		else {
			if (contextOp && contextOp.container == 'pair')
				return ' []';
			else
				return offsetStart + '[]';
		}
	}

	concatenateItems(item1, item2, contextOp) {
		return item1 + '\n' + item2;
	}

	multiplyItem(item, repetitions, contextOp, depth) {
		let offset = this.getOffset(depth);
		let multiplier = parseInt(repetitions);
		let arr = [];
		for (let index = 0; index < multiplier; index++) {
			if (contextOp == 'a')
				arr.push(offset + '- ' + item);
			else
				arr.push(offset + item);
		}

		return arr.join('\n');
	}

	getOffset(depth) {
		return '  '.repeat(depth);
	}

	resolve(left, operator, right, node, contextOp) {
		if (!operator) { // It's single item
			if (right == 'o')
				return this.getObject('', node, node.depth);
			else if (right == 'a')
				return this.getArray('', node, node.depth);
			else
				return this.getPair(right, '', node, node.depth);
		}
		else if (operator == '[') { // '[' is only for pairs
			let value = '';
			if (right == 'o')
				value = this.getObject('', node.right, node.depth);
			else if (right == 'a')
				value = this.getArray('', node.right, node.depth);
			else
				value = right;

			return this.getPair(left, value, node, node.depth);
		}
		else if (operator == '>') {
			let content = right;

			if (right == 'o') {
				content = this.getObject('', node.right, node.right.depth)
			}
			else if(right.match(/^[0-9a-zA-Z]+$/)) {
				content = this.getYamlItem(right, node.right.container, node.right.depth, node.right);
			}

			if (left == 'o')
				return this.getObject(content, node, node.depth);
			else if (left == 'a')
				return this.getArray(content, node, node.depth);
			else 
				return '###'
		}
		else if (operator == ',') {
			let item1 = left;
			let item2 = right;

			if (left == 'o' || left == 'a') {
				item1 = left == 'o' ? this.getObject('', node, node.depth) 
					: this.getArray('', node, node.depth);
			}
			else if(left.match(/^[0-9a-zA-Z]+$/)) {
				item1 = this.getYamlItem(left, node.left.container, node.left.depth, node.left);
			}

			if (right == 'o' || right == 'a') {
				item2 = right == 'o' ? this.getObject('', node, node.depth) 
					: this.getArray('', node, node.depth);
			}
			else if(right.match(/^[0-9a-zA-Z]+$/)) {
				item2 = this.getYamlItem(right, node.right.container, node.right.depth, node.left);
			}

			return this.concatenateItems(item1, item2);
		}
		else if (operator == '*') {
			let repetitions = parseInt(right);
			if (!left) // No operand
				left = this.getPair('', '', node, node.depth);
			else if (left == 'o')
				left = this.getObject('', node, node.depth);

			return this.multiplyItem(left, repetitions, node, 0);
		}

		return this.getItem(right, node);
	}

	getYamlItem(value, container, depth, node) {
		let result = '';
		if (node.container == 'array')
			result = this.getValueItem(value, node);
		else //if (container == 'object')
			result = this.getPair(value, '', node, depth);
		// else
		// 	result = '#';

		return result;
	}
	
	setNodesDepth(node, contextOp, currentDepth, currentContainer) {
		node.depth = currentDepth;
		node.container = currentContainer;

		if(node.isLeafe()) {
			return;
		}
		
		var depthOperators = ['>'];

		if (depthOperators.includes(node.root)) {
			if (currentContainer != 'array')
				currentDepth++;

			if (node.left.root === 'a')
				currentContainer = 'array';
			else if (node.left.root === 'o') // objects inside arrays does not change context.
				currentContainer = 'object';
		}

		if (node.root == '[')
			currentContainer = 'pair';

		if (node.left) this.setNodesDepth(node.left, node, currentDepth, currentContainer);
		if (node.right) this.setNodesDepth(node.right, node, currentDepth, currentContainer);
	}
}
exports.YamlResolver = YamlResolver;
