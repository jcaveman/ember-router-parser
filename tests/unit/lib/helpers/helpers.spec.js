'use strict';

var assert = require('assert');
var helpers = require('../../../../lib/helpers/helpers');

describe('helpers', function() {
  describe('mergeObjects', function() {
    it('copies all keys from o2 to o1', function() {
      var o1 = {
        hello: 'world',
        bye: 'adrian'
      };
      var o2 = {
        bye: 'jose',
        taco: 'salsa'
      };

      helpers.mergeObjects(o1, o2);

      var expected = {
        hello: 'world',
        bye: 'jose',
        taco: 'salsa'
      };
      assert.deepEqual(o1, expected);
    });
  });
});
