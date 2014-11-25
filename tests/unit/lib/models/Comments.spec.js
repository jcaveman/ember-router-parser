'use strict';

var Comments = require('../../../../lib/models/Comments');
var assert = require('assert');
var sinon = require('sinon');

var comments = new Comments({});

describe('Comments', function() {
  describe('format', function() {
    beforeEach(function() {
      sinon.stub(comments, 'parse');
    });

    afterEach(function() {
      comments.parse.restore();
    });

    it('sets comments to empty object if param is undefined', function() {
      comments.format();

      assert.deepEqual(comments.comments, {});
    });

    it('sets comments to empty object if param is empty array', function() {
      comments.format([]);

      assert.deepEqual(comments.comments, {});
    });

    it('formats param values into comments array', function() {
      comments.parse.returnsArg(0);
      var c = [
        {value: '*\n * @documenturl\n ', loc: {end: {line: 50}}},
        {value: ' @documenturl', loc: {end: {line: 89}}},
        {value: ' @cccc', loc: {end: {line: 132}}}
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

  describe('parse', function() {
    beforeEach(function() {
      sinon.stub(comments, 'parseParam');
    });

    afterEach(function() {
      comments.parseParam.restore();
    });

    it('parses main comment', function() {
      var comment = '*\n   * This is a comment\n   * with two lines\n';
      var parsed = comments.parse(comment);

      var expected = {
        main: 'This is a comment with two lines',
        annotations: {},
        params: {}
      };
      assert.deepEqual(parsed, expected);
    });

    it('parses main comment and params', function() {
      var comment = '*\n   * Some main comment\n' +
          '   * @param some_param description of param\n' +
          '   * @param other_param other description of param\n';
      comments.parseParam.onCall(0).returns(['some_param', 'description of param']);
      comments.parseParam.onCall(1).returns(['other_param', 'other description of param']);

      var parsed = comments.parse(comment);

      var expected = {
        main: 'Some main comment',
        params: {
          'some_param': 'description of param',
          'other_param': 'other description of param'
        },
        annotations: {}
      };
      assert.deepEqual(parsed, expected);
    });

    it('correctly parses params and annotations', function() {
      var comment = '*\n   * Some main comment\n' +
          '   * @param some_param description of param\n' +
          '   * @documentUrl\n';
      comments.parseParam.returns(['some_param', 'description of param']);

      var parsed = comments.parse(comment);

      var expected = {
        main: 'Some main comment',
        params: {
          'some_param': 'description of param'
        },
        annotations: {
          documentUrl: ''
        }
      };
      assert.deepEqual(parsed, expected);
    });

    it('correctly parses inline annotations', function() {
      var comment = '@documentUrl';
      comments.parseParam.returns(['some_param', 'description of param']);

      var parsed = comments.parse(comment);

      var expected = {
        main: '',
        params: {},
        annotations: {
          documentUrl: 'documentUrl'
        }
      };
      assert.deepEqual(parsed, expected);
    });
  });

  describe('parseParam', function() {
    it('returns array with param and value', function() {
      var parsed = comments.parseParam('param taquitos con frijolito');

      var expected = ['taquitos', 'con frijolito'];
      assert.deepEqual(parsed, expected);
    });
  });

  describe('shouldDocumentRoute', function() {
    beforeEach(function() {
      sinon.stub(comments, 'getExpressionComment').returns({});
    });

    afterEach(function() {
      comments.getExpressionComment.restore();
    });

    it('returns false if expression start line doesn\'t match comment', function() {
      assert.strictEqual(
        comments.shouldDocumentRoute({loc: {start: {line: 35}}}),
        false
      );
    });

    it('returns false if no @documentUrl annotation in comment', function() {
      var comment = {
        main: 'hello',
        annotations: {}
      };
      comments.getExpressionComment.returns(comment);

      assert.strictEqual(
        comments.shouldDocumentRoute({loc: {start: {line: 35}}}),
        false
      );
    });

    it('returns true if @documentUrl in comment', function() {
      var comment = {
        main: 'hello',
        annotations: {
          'documentUrl': ''
        },
        params: {}
      };
      comments.getExpressionComment.returns(comment);

      assert.strictEqual(comments.shouldDocumentRoute({range: [35]}), true);
    });
  });

  describe('getExpressionComment', function() {
    it('returns empty object if no comment for expression', function() {
      comments.comments = {};

      assert.deepEqual(
        comments.getExpressionComment({loc: {start: {line: 35}}}),
        {}
      );
    });

    it('returns comment if there is a comment for the expression', function() {
      comments.comments = {
        34: {
          main: 'hello',
          annotations: {
            'documentUrl': ''
          }
        }
      };

      assert.strictEqual(
        comments.getExpressionComment({loc: {start: {line: 35}}}),
        comments.comments['34']
      );
    });
  });
});
