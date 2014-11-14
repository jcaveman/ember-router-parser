'use strict';

var Comments = require('../../../../lib/models/Comments');
var assert = require('assert');

var comments = new Comments({});

describe('Comments', function() {
  describe('format', function() {
    it('sets comments to empty object if param is undefined', function() {
      comments.format();

      assert.deepEqual(comments.comments, {});
    });

    it('sets comments to empty object if param is empty array', function() {
      comments.format([]);

      assert.deepEqual(comments.comments, {});
    });

    it('formats param values into comments array', function() {
      var c = [
        {value: '*\n * @documenturl\n ', range: [27, 50]},
        {value: ' @documenturl', range: [74, 89]},
        {value: ' @cccc', range: [124, 132]}
      ];

      comments.format(c);

      var expected = {
        50: '*\n * @documenturl\n ',
        89: ' @documenturl',
        132: ' @cccc'
      };
      assert.deepEqual(comments.comments, expected);
    });
  });

  describe('shouldDocumentRoute', function() {
    it('returns false if expression range doesn\'t match route', function() {
      comments.comments = {};

      assert.strictEqual(comments.shouldDocumentRoute({range: [35]}), false);
    });

    it('returns false if no @documentUrl annotation in comment', function() {
      comments.comments = {
        34: 'hello'
      };

      assert.strictEqual(comments.shouldDocumentRoute({range: [35]}), false);
    });

    it('returns true if @documentUrl in comment', function() {
      comments.comments = {
        34: 'hello @documentUrl'
      };

      assert.strictEqual(comments.shouldDocumentRoute({range: [35]}), true);
    });

    it('returns true if @documentUrl in comment and exact index match', function() {
      comments.comments = {
        35: 'hello @documentUrl'
      };

      assert.strictEqual(comments.shouldDocumentRoute({range: [35]}), true);
    });
  });
});
