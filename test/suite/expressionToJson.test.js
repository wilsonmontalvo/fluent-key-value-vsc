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
	let tabChar = ' ';

	test('evaluateExpression_word_shouldReturnAnEmptyPair', () => {
		let node = new Node(null, 'image', null);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"image": ');
	});

	test('evaluateExpression_word1,word2_shouldReturn02pairs', () => {
		// Expression: name,image
		let left = new Node(null, 'name', null);
		let right = new Node(null, 'image', null);
		let node = new Node(left, ',', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"name": ,\n"image": ');
	});

	test('evaluateExpression_word1,word2,word3_shouldReturn03pairs', () => {
		// Expression: name,image,port
		let node1 = new Node(null, 'name', null);
		let node2 = new Node(null, 'image', null);
		let node3 = new Node(null, 'port', null);

		let node4 = new Node(node2, ',', node3);
		let tree = new Node(node1, ',', node4);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"name": ,\n"image": ,\n"port": ');
	});
	
	test('evaluateExpression_*2_shouldReturn02EmptyPairs', () => {
		// Expression: *2
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, '*', node1);
		resolver.setNodesDepth(node2, null, 0);

		var result = expAnalyzer.evaluateExpression(node2, null);

		assert.equal(result, '"": ,\n"": ');
	});

	test('evaluateExpression_o_shouldReturnAnEmptyObject', () => {
		let node = new Node(null, 'o', null);
		
		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '{\n}');
	});

	test('evaluateExpression_word[o]_shouldReturnOnePairWithObjectValue', () => {
		// Expression: repository[o]
		let node1 = new Node(null, 'o', null);
		let node2 = new Node(null, 'repository', null);
		let node3 = new Node(node2, '[', node1);

		var result = expAnalyzer.evaluateExpression(node3, null);

		assert.equal(result, '"repository": {\n}');
	});

	test('evaluateExpression_o>word_shouldReturnAnObjectWith01PairWithoutValue', () => {
		// Expression: o>image
		let left = new Node(null, 'o', null);
		let right = new Node(null, 'image', null);
		let node = new Node(left, '>', right);
		resolver.setNodesDepth(node, null, 0);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '{\n  "image": \n}');
	});

	test('evaluateExpression_o,o_shouldReturn02EmptyObjects', () => {
		// Expression: o,o
		let left = new Node(null, 'o', null);
		let right = new Node(null, 'o', null);
		let node = new Node(left, ',', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '{\n},\n{\n}');
	});

	test('evaluateExpression_o>word[value]_shouldReturnAnObjectWith01PairWithValue', () => {
		// Expression: o>port[80]
		let node1 = new Node(null, 'o', null);
		let node2 = new Node(null, 'port', null);
		let node3 = new Node(null, '80', null);
		
		let node4 = new Node(node2, '[', node3);
		let tree = new Node(node1, '>', node4);
		
		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n  "port": 80\n}');
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

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n  "image": ,\n  "port": 80\n}');
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

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n  "port": 80,\n  "image": \n}');
	});

	test('evaluateExpression_o>*2_shouldReturnAnObjectWith02EmptyPairs', () => {
		// Expression: o>*2
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, '*', node1);

		let node3 = new Node(null, 'o', null);
		let tree = new Node(node3, '>', node2);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n  "": ,\n  "": \n}');
	});
	
	test('evaluateExpression_(word)*2_shouldReturn02EqualPairsWithKey', () => {
		// Expression: (image)*2
		let node1 = new Node(null, 'image', null);
		let node2 = new Node(null, '(', node1);

		let node3 = new Node(null, '2', null);
		let tree = new Node(node2, '*', node3);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"image": ,\n"image": ');
	});

	test('evaluateExpression_(o>word1,word2)*2_shouldReturn02ObjectsWithTwoParsEach', () => {
		// Expression: (o>name,image)*2
		let node1 = new Node(null, 'name', null);
		let node2 = new Node(null, 'image', null);
		let node3 = new Node(node1, ',', node2);

		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);

		let node6 = new Node(null, '2', null);
		let tree = new Node(node5, '*', node6);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '{\n  "name": ,\n  "image": \n},\n{\n  "name": ,\n  "image": \n}');
	});

	test('evaluateExpression_a_shouldReturnAnEmptyArray', () => {
		let node = new Node(null, 'a', null);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '[\n]');
	});
	
	test('evaluateExpression_a,a_shouldReturn02EmptyArrays', () => {
		// Expression: a,a
		let left = new Node(null, 'a', null);
		let right = new Node(null, 'a', null);
		let node = new Node(left, ',', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '[\n],\n[\n]');
	});

	test('evaluateExpression_a>o_shouldReturnAnArrayWithAnEmptyObject', () => {
		// Expression: a>o
		let left = new Node(null, 'a', null);
		let right = new Node(null, 'o', null);
		let node = new Node(left, '>', right);

		resolver.setNodesDepth(node, null, 0);
		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '[\n  {\n  }\n]');
	});

	test('evaluateExpression_a>o>word1,word2_shouldReturnAnArrayWithAnObjectWith02Pairs', () => {
		// Expression: a>o>name,image
		let node1 = new Node(null, 'name', null);
		let node2 = new Node(null, 'image', null);
		let node3 = new Node(node1, ',', node2);

		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);

		let node6 = new Node(null, 'a', null);
		let tree = new Node(node6, '>', node5);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '[\n  {\n    "name": ,\n    "image": \n  }\n]');
	});

	test('evaluateExpression_a[word1,boolean,number]_shouldReturnArrayWithElements', () => {
		// Expression: a[json,true,5]
		let node1 = new Node(null, 'true', null);
		let node2 = new Node(null, '5', null);
		let node3 = new Node(node1, ',', node2);

		let node4 = new Node(null, 'json', null);
		let node5 = new Node(node4, ',', node3);

		let node6 = new Node(null, 'a', null);
		let tree = new Node(node6, '>', node5);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '[\n  "json",\n  true,\n  5\n]');
	});

	test('evaluateExpression_a>(o>word1,word2)*2_shouldReturnArrayWithElements', () => {
		// Expression: a>(o>name,image)*2
		let node1 = new Node(null, 'name', null);
		let node2 = new Node(null, 'image', null);
		let node3 = new Node(node1, ',', node2);

		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);

		let node6 = new Node(null, '2', null);
		let node7 = new Node(node5, '*', node6);

		let node8 = new Node(null, 'a', null);
		let tree = new Node(node8, '>', node7);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '[\n  {\n    "name": ,\n    "image": \n  },\n  {\n    "name": ,\n    "image": \n  }\n]');
	});

	test('evaluateExpression_word[string]_shouldReturnAPairWithStringValue', () => {
		// Expression: language[json]
		let left = new Node(null, 'language', null);
		let right = new Node(null, 'json', null);
		let node = new Node(left, '[', right);

		var result = expAnalyzer.evaluateExpression(node, null);

		assert.equal(result, '"language": "json"');
	});

	test('evaluateExpression_word[true]_shouldReturnPairWithBoolValue', () => {
		// Expression: isActive[true]
		let node1 = new Node(null, 'true', null);
		let node2 = new Node(null, 'isActive', null);
		let tree = new Node(node2, '[', node1);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"isActive": true');
	});

	test('evaluateExpression_word[number]_shouldReturnPairWithNumericValue', () => {
		// Expression: port[8080]
		let node1 = new Node(null, '8080', null);
		let node2 = new Node(null, 'port', null);
		let tree = new Node(node2, '[', node1);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"port": 8080');
	});

	test('evaluateExpression_word[o]_shouldReturnPairWithObjectValue', () => {
		// Expression: isActive[o]
		let node1 = new Node(null, 'o', null);
		let node2 = new Node(null, 'isActive', null);
		let tree = new Node(node2, '[', node1);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"isActive": {\n}');
	});

	test('evaluateExpression_word[a]_shouldReturnPairWithArrayValue', () => {
		// Expression: isActive[a]
		let node1 = new Node(null, 'a', null);
		let node2 = new Node(null, 'isActive', null);
		let tree = new Node(node2, '[', node1);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"isActive": [\n]');
	});

	test('evaluateExpression_word1,word2[value]_shouldReturn02pairsAnd2ndWithValue', () => {
		// Expression: image,port[80]
		let node1 = new Node(null, 'image', null);
		let node2 = new Node(null, 'port', null);
		let node3 = new Node(null, '80', null);

		let node4 = new Node(node2, '[', node3);
		let tree = new Node(node1, ',', node4);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"image": ,\n"port": 80');
	});

	test('evaluateExpression_word1[o>word2,word3]_shouldReturnPairWithObjectValueHaving02Pairs', () => {
		// Expression: repository[o>type,url]
		let node1 = new Node(null, 'type', null);
		let node2 = new Node(null, 'url', null);
		let node3 = new Node(node1, ',', node2);

		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);

		let node6 = new Node(null, 'repository', null);
		let tree = new Node(node6, '[', node5);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"repository": {\n  "type": ,\n  "url": \n}');
	});

	test('evaluateExpression_word1[o>*2]_shouldReturnPairWithObjectValueHaving02Pairs', () => {
		// Expression: repository[o>*2]
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, '*', node1);

		let node3 = new Node(null, 'o', null);
		let node4 = new Node(node3, '>', node2);
		
		let node5 = new Node(null, 'repository', null);
		let tree = new Node(node5, '[', node4);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"repository": {\n  "": ,\n  "": \n}');
	});

	test('evaluateExpression_word[a>o*2]_shouldReturnPairWithArrayValueHaving02Objects', () => {
		// Expression: snippets[a>o*2]
		let node1 = new Node(null, '2', null);
		let node2 = new Node(null, 'o', null);
		let node3 = new Node(node2, '*', node1);
	
		let node4 = new Node(null, 'a', null);
		let node5 = new Node(node4, '>', node3);

		let node6 = new Node(null, 'snippets', null);
		let tree = new Node(node6, '[', node5);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"snippets": [\n  {\n  },\n  {\n  }\n]');
	});

	test('evaluateExpression_word1[a>o>word2,word3]_shouldReturnPairWithArrayValueHavingObjectWith02Pairs', () => {
		// Expression: containers[a>o>name,image]
		let node1 = new Node(null, 'image', null);
		let node2 = new Node(null, 'name', null);
		let node3 = new Node(node2, ',', node1);
		
		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);
		
		let node6 = new Node(null, 'a', null);
		let node7 = new Node(node6, '>', node5);

		let node8 = new Node(null, 'containers', null);
		let tree = new Node(node8, '[', node7);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"containers": [\n  {\n    "name": ,\n    "image": \n  }\n]');
	});

	test('evaluateExpression_word1[a>(o>word2,word3)*2]_shouldReturnPairWithArrayValueHaving02ObjectsWith02PairsEach', () => {
		// Expression: containers[a>(o>name,image)*2]
		let node1 = new Node(null, 'image', null);
		let node2 = new Node(null, 'name', null);
		let node3 = new Node(node2, ',', node1);
		
		let node4 = new Node(null, 'o', null);
		let node5 = new Node(node4, '>', node3);
		
		let node6 = new Node(null, '2', null);
		let node7 = new Node(node5, '*', node6);
		
		let node8 = new Node(null, 'a', null);
		let node9 = new Node(node8, '>', node7);

		let node10 = new Node(null, 'containers', null);
		let tree = new Node(node10, '[', node9);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"containers": [\n  {\n    "name": ,\n    "image": \n  },\n  {\n    "name": ,\n    "image": \n  }\n]');
	});

	test('evaluateExpression_word1[a>(o>word2[value2],word3[value3]),(o>word4[value4],word5[value5])]_shouldReturnPairWithArrayValueHaving02ObjectsWith02PairsEach', () => {
		// Expression: containers[a>(o>image[redis],port[80]),(o>image[nginx],port[81])
		let node1 = new Node(null, 'port', null);
		let node2 = new Node(null, '80', null);
		let node3 = new Node(node1, '[', node2);
		
		let node4 = new Node(null, 'image', null);
		let node5 = new Node(null, 'redis', null);
		let node6 = new Node(node4, '[', node5);

		let node7 = new Node(node6, ',', node3);
		
		let node8 = new Node(null, 'o', null);
		let node9 = new Node(node8, '>', node7);
		
		let node10 = new Node(null, 'port', null);
		let node11 = new Node(null, '81', null);
		let node12 = new Node(node10, '[', node11);
		
		let node13 = new Node(null, 'image', null);
		let node14 = new Node(null, 'nginx', null);
		let node15 = new Node(node13, '[', node14);

		let node16 = new Node(node15, ',', node12);
		
		let node17 = new Node(null, 'o', null);
		let node18 = new Node(node17, '>', node16);
		
		let node19 = new Node(node9, ',', node18);
		
		let node20 = new Node(null, 'a', null);
		let node21 = new Node(node20, '>', node19);
		let node22 = new Node(null, 'containers', null);
		let tree = new Node(node22, '[', node21);

		resolver.setNodesDepth(tree, null, 0);

		var result = expAnalyzer.evaluateExpression(tree, null);

		assert.equal(result, '"containers": [\n  {\n    "image": "redis",\n    "port": 80\n  },\n  {\n    "image": "nginx",\n    "port": 81\n  }\n]');
	});

});
