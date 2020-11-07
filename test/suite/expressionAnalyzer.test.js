const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const { ExpressionAnalyzer } = require('../../ExpressionAnalyzer');
const { JsonResolver } = require('../../JsonResolver');
const { Node } = require('../../Node');

suite('Resolver Test Suite', () => {
	vscode.window.showInformationMessage('Start JsonResolver tests.');
	let resolver = new JsonResolver();
	let expAnalyzer = new ExpressionAnalyzer(resolver);

	test('evaluateExpression_word_shouldReturnAnEmptyPair', () => {
		let node = new Node(null, 'image', null);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"image": ');
	});

	test('evaluateExpression_o_shouldReturnAnEmptyObject', () => {
		let node = new Node(null, 'o', null);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '{\n\t\n}');
	});

	test('evaluateExpression_a_shouldReturnAnEmptyObject', () => {
		let node = new Node(null, 'a', null);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '[\n\t\n]');
	});

	test('evaluateExpression_02CommaSeparatedWords_shouldReturn02pairs', () => {
		// Expression: name,image
		let left = new Node(null, 'name', null);
		let right = new Node(null, 'image', null);
		let node = new Node(left, ',', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"name": ,\n"image": ');
	});

	test('evaluateExpression_03CommaSeparatedWords_shouldReturn03pairs', () => {
		// Expression: name,image,port
		let node1 = new Node(null, 'name', null);
		let node2 = new Node(null, 'image', null);
		let node3 = new Node(null, 'port', null);

		let node4 = new Node(node2, ',', node3);
		let tree = new Node(node1, ',', node4);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"name": ,\n"image": ,\n"port": ');
	});

	test('evaluateExpression_word[value]_shouldReturnAPairWithValue', () => {
		// Expression: port[80]
		let left = new Node(null, 'port', null);
		let right = new Node(null, '80', null);
		let node = new Node(left, '[', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"port": "80"');
	});
	
	test('evaluateExpression_word1,word2[value]_shouldReturn02pairsAnd2ndWithValue', () => {
		// Expression: image,port[80]
		let node1 = new Node(null, 'image', null);
		let node2 = new Node(null, 'port', null);
		let node3 = new Node(null, '80', null);

		let node4 = new Node(node2, '[', node3);
		let tree = new Node(node1, ',', node4);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"image": ,\n"port": "80"');
	});

	test('evaluateExpression_o>word_shouldReturnAnObjectWith01PairWithoutValue', () => {
		// Expression: o>image
		let left = new Node(null, 'o', null);
		let right = new Node(null, 'image', null);
		let node = new Node(left, '>', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '{\n\t"image": \n}');
	});

	test('evaluateExpression_o>word[value]_shouldReturnAnObjectWith01PairWithValue', () => {
		// Expression: o>port[80]
		let node1 = new Node(null, 'o', null);
		let node2 = new Node(null, 'port', null);
		let node3 = new Node(null, '80', null);
		
		let node4 = new Node(node2, '[', node3);
		let tree = new Node(node1, '>', node4);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n\t"port": "80"\n}');
	});

	test('evaluateExpression_o>word1,word2[value]_shouldReturnAnObjectWith02PairsWithValue', () => {
		// Expression: o>image,port[80]
		let node1 = new Node(null, 'port', null);
		let node2 = new Node(null, '80', null);
		let node3 = new Node(node1, '[', node2);

		let node4 = new Node(null, 'image', null);
		let node5 = new Node(node4, ',', node3);
		
		let node6 = new Node(null, 'o', null);
		let tree = new Node(node6, '>', node5);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n\t"image": ,\n"port": "80"\n}');
	});

	test('evaluateExpression_o>word1[value],word2_shouldReturnAnObjectWith02PairsWithValue', () => {
		// Expression: o>port[80],image
		let node1 = new Node(null, 'port', null);
		let node2 = new Node(null, '80', null);
		let node3 = new Node(node1, '[', node2);

		let node4 = new Node(null, 'image', null);
		let node5 = new Node(node3, ',', node4);
		
		let node6 = new Node(null, 'o', null);
		let tree = new Node(node6, '>', node5);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n\t"port": "80",\n"image": \n}');
	});

	test('evaluateExpression_*2_shouldReturn02EmptyPairs', () => {
		// Expression: *2
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, '*', node1);

		var result = expAnalyzer.evaluateExpression(node2, null);

		assert.equal(result, '"": ,\n"": ');
	});

	test('evaluateExpression_o>*2_shouldReturnAnObjectWith02EmptyPairs', () => {
		// Expression: o>*2
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, '*', node1);

		let node3 = new Node(null, 'o', null);
		let tree = new Node(node3, '>', node2);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n\t"": ,\n"": \n}');
	});
});
