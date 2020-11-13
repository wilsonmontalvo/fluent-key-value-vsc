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

	getPair(key, value, contextOp) {
		if (value === '') {
			return '"' + key + '": ';
		}
		else if (value === 'true' || value === 'false' || value === 'null' || value.match(/^[0-9]+$/)) {
			return '"' + key + '": ' + value;
		}
		else if (value.match(/^[0-9a-zA-Z]+$/)) { // "Value" is a primitive value
			return '"' + key + '": "' + value + '"';
		}
		else { // "Value" is an object value
			return '"' + key + '": ' + value;
		}
	}

	getObject(pair, contextOp) {
		return '{\n\t' + pair + '\n}';
	}

	getArray(content, contextOp) {
		return '[\n\t' + content + '\n]';
	}

	concatenateItems(item1, item2, contextOp) {
		return item1 + ',\n' + item2;
	}

	multiplyItem(item, repetitions, contextOp) {
		let multiplier = parseInt(repetitions);
		let arr = [];
		for (let index = 0; index < multiplier; index++) {
			arr.push(item);
		}

		return arr.join(',\n');
	}

	resolve(left, operator, right, contextOp) {
		if (!operator) { // It's single item
			if (right == 'o')
				return this.getObject('');
			else if (right == 'a')
				return this.getArray('');
			else
				return this.getPair(right, '');
		}
		else if (operator == '[') { // '[' is only for pairs
			return this.getPair(left, right);
		}
		else if (operator == '>') {
			let content = right;
			if(right.match(/^[0-9a-zA-Z]+$/))
				content = this.getPair(right, '');
			if (left == 'o')
				return this.getObject(content);
			else if (left == 'a')
				return this.getArray(content);
			else 
				return '###'
		}
		else if (operator == ',') {
			let item1 = left;
			let item2 = right;

			if(left.match(/^[0-9a-zA-Z]+$/))
				item1 = this.getPair(left, '');
			if(right.match(/^[0-9a-zA-Z]+$/))
				item2 = this.getPair(right, '');

			return this.concatenateItems(item1, item2);
		}
		else if (operator == '*') {
			let repetitions = parseInt(right);
			if (!left)
				left = this.getPair('', '');
			else if (left == 'o')
				left = this.getObject('', contextOp);

			return this.multiplyItem(left, repetitions, contextOp);
		}

		return this.getItem(right, contextOp);
	}
}
exports.JsonResolver = JsonResolver;
