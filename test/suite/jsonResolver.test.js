const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const { JsonResolver } = require('../../JsonResolver');

suite('Resolver Test Suite', () => {
	vscode.window.showInformationMessage('Start JsonResolver tests.');

	test('Resolve_simpleWord_shouldReturnAPair', () => {
		let resolver = new JsonResolver();
		var pair = resolver.getItem('name', null);
		assert.equal(pair, '"name": ');
	});
});
