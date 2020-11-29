const { KeyValueResolver } = require("./KeyValueResolver");
const { Node } = require("./Node");

class JsonResolver extends KeyValueResolver {
	getItem(part, contextOp) {
		var reservedWords = ['a', 'o'];

		if (!contextOp || reservedWords.includes(contextOp)) { // It's the 'key'
			let prefix = '"' + part + '": ';
			return prefix;
		}
		else { // It's the value
			return part;
		}
	}

	getValueItem(value, depth) {
		let offset = this.getOffset(depth);

		if (value === 'true' || value === 'false' || value === 'null' || value.match(/^[0-9]+$/))
			return offset + value;
		else
			return offset + '"' + value + '"';
	}

	getOffset(depth) {
		return '  '.repeat(depth);
	}

	getPair(key, value, contextOp, depth) {
		let offset = this.getOffset(depth);

		if (value === '') {
			return offset + '"' + key + '": ';
		}
		else if (value === 'true' || value === 'false' || value === 'null' || value.match(/^[0-9]+$/)) {
			return offset + '"' + key + '": ' + value;
		}
		else if (value.match(/^[0-9a-zA-Z]+$/)) { // "Value" is a primitive value
			return offset + '"' + key + '": "' + value + '"';
		}
		else { // "Value" is an object value
			return offset + '"' + key + '": ' + value;
		}
	}

	getObject(pair, contextOp, depth) {
		let offsetEnd = this.getOffset(depth);
		let offsetStart = contextOp && contextOp.container == 'pair' ? '' : offsetEnd; // Remove offset if the object is a pair's value (it's inline).

		if (pair)
			return offsetStart + '{\n' + pair + '\n' + offsetEnd + '}';
		else
			return offsetStart + '{\n' + offsetEnd + '}';
	}

	getArray(content, contextOp, depth) {
		let offsetEnd = this.getOffset(depth);
		let offsetStart = contextOp && contextOp.container == 'pair' ? '' : offsetEnd; // Remove offset if the array is a pair's value (it's inline).

		if (content)
			return offsetStart + '[\n' + content + '\n' + offsetEnd + ']';
		else
			return offsetStart + '[\n' + offsetEnd + ']';
	}

	concatenateItems(item1, item2, contextOp) {
		return item1 + ',\n' + item2;
	}

	multiplyItem(item, repetitions, contextOp, depth) {
		let offset = this.getOffset(depth);
		let multiplier = parseInt(repetitions);
		let arr = [];
		for (let index = 0; index < multiplier; index++) {
			arr.push(offset + item);
		}

		return arr.join(',\n');
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
				value = this.getObject('', node, node.depth);
			else if (right == 'a')
				value = this.getArray('', node, node.depth);
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
				content = this.getJsonItem(right, node.right.container, node.right.depth);
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
				item1 = this.getJsonItem(left, node.left.container, node.left.depth);
			}

			if (right == 'o' || right == 'a') {
				item2 = right == 'o' ? this.getObject('', node, node.depth) 
					: this.getArray('', node, node.depth);
			}
			else if(right.match(/^[0-9a-zA-Z]+$/)) {
				item2 = this.getJsonItem(right, node.right.container, node.right.depth);
			}

			return this.concatenateItems(item1, item2);
		}
		else if (operator == '*') {
			let repetitions = parseInt(right);
			if (!left)
				left = this.getPair('', '', node, node.depth);
			else if (left == 'o')
				left = this.getObject('', node, node.depth);

			return this.multiplyItem(left, repetitions, node, 0);
		}

		return this.getItem(right, node);
	}

	getJsonItem(value, container, depth) {
		let result = '';
		if (container == 'array')
			result = this.getValueItem(value, depth);
		else //if (container == 'object')
			result = this.getPair(value, '', null, depth);
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

	// resolve(left, operator, right, contextOp) {
	// 	if (!operator) { // It's single item
	// 		if (right == 'o')
	// 			return this.getObject('');
	// 		else if (right == 'a')
	// 			return this.getArray('');
	// 		else
	// 			return this.getPair(right, '');
	// 	}
	// 	else if (operator == '[') { // '[' is only for pairs
	// 		return this.getPair(left, right);
	// 	}
	// 	else if (operator == '>') {
	// 		let content = right;
	// 		if(right.match(/^[0-9a-zA-Z]+$/))
	// 			content = this.getPair(right, '');
	// 		if (left == 'o')
	// 			return this.getObject(content);
	// 		else if (left == 'a')
	// 			return this.getArray(content);
	// 		else 
	// 			return '###'
	// 	}
	// 	else if (operator == ',') {
	// 		let item1 = left;
	// 		let item2 = right;

	// 		if(left.match(/^[0-9a-zA-Z]+$/))
	// 			item1 = this.getPair(left, '');
	// 		if(right.match(/^[0-9a-zA-Z]+$/))
	// 			item2 = this.getPair(right, '');

	// 		return this.concatenateItems(item1, item2);
	// 	}
	// 	else if (operator == '*') {
	// 		let repetitions = parseInt(right);
	// 		if (!left)
	// 			left = this.getPair('', '');
	// 		else if (left == 'o')
	// 			left = this.getObject('', contextOp);

	// 		return this.multiplyItem(left, repetitions, contextOp);
	// 	}

	// 	return this.getItem(right, contextOp);
	// }
}
exports.JsonResolver = JsonResolver;
