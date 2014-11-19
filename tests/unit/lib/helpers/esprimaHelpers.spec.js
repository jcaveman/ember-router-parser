'use strict';

var assert = require('assert');
var esprima = require('esprima');
var esprimaHelpers = require('../../../../lib/helpers/esprimaHelpers');


describe('esprimaHelpers', function() {
  describe('getPropertyValue', function() {
    it('returns value of the property if found', function() {
      var object = 'var a = {hello: "world", bye: "universe"}';
      var ast = esprima.parse(object).body[0].declarations[0].init;

      var actual = esprimaHelpers.getPropertyValue(ast, 'bye');

      assert.strictEqual(actual, 'universe');
    });

    it('returns undefined if property not found', function() {
      var object = 'var a = {hello: "world", bye: "universe"}';
      var ast = esprima.parse(object).body[0].declarations[0].init;

      var actual = esprimaHelpers.getPropertyValue(ast, 'no');

      assert.ok(!actual);
    });
  });
});
