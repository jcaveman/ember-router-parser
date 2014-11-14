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
        {value: '*\n * @documentUrl\n ', range: [27, 50]},
        {value: ' @documentUrl', range: [74, 89]},
        {value: ' @cccc', range: [124, 132]}
      ];

      comments.format(c);

      var expected = {
        50: '*\n * @documentUrl\n ',
        89: ' @documentUrl',
        132: ' @cccc'
      };
      assert.deepEqual(comments.comments, expected);
    });
  });
});
