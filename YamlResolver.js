const { KeyValueResolver } = require("./KeyValueResolver");

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

	getPair(key, value, contextOp) {
		if (value.match(/^[0-9a-zA-Z]+$/)) { // It's a primitive value
			return key + '' + value;
		}
		else { // It's an object value
			return key + '\n\t' + value;
		}
	}

	getObject(pair, contextOp) {
		if (contextOp === 'a')
			return '- ' + pair;
		else
			return pair;
	}

	concatenateItems(item1, item2, contextOp) {
		return item1 + '\n' + item2;
	}

	multiplyItem(item, repetitions, contextOp) {
		let multiplier = parseInt(repetitions);
		let arr = [];
		for (let index = 0; index < multiplier; index++) {
			if (contextOp == 'a')
				arr.push('- ' + item);
			else
				arr.push(item);
		}

		return arr.join('\n');
	}

	resolve(left, operator, right, contextOp) {
		let isObject = left == 'o';
		let isArray = left == 'a';

		if (!operator) {
			return this.getItem(right, contextOp);
		}
		else if (operator == '[') { // '[' is only for pairs
			return this.getPair(left, right, contextOp); // "left" is expected to be a resolved "key" (formatted/followed by ":")
		}
		else if (operator == '>') {
			if (isObject)
				return this.getObject(right, contextOp);
			if (isArray)
				return '\n\t' + right;
		}
		else if (operator == ',') {
			return this.concatenateItems(left, right);
		}
		else if (operator == '*') {
			let repetitions = parseInt(right);
			return this.multiplyItem(left, repetitions, contextOp);
		}

		return this.getItem(right, contextOp);
	}
}
