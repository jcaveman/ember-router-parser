'use strict';

var proxyquire = require('proxyquire');
var assert = require('assert');
var sinon = require('sinon');

var routerParser = {
  getRoutesFromRouter: sinon.stub()
};

var emberRoutesDocumenter = proxyquire('../../../lib/emberRoutesDocumenter', {
  './routerParser': routerParser
});

describe('emberRoutesDocumenter', function() {
  describe('main', function() {
    beforeEach(function() {
      sinon.stub(emberRoutesDocumenter, 'getArgs');
    });

    afterEach(function() {
      emberRoutesDocumenter.getArgs.restore();
      routerParser.getRoutesFromRouter.reset();
    });

    it('calls getRoutesFromRouter with given router', function() {
      emberRoutesDocumenter.getArgs.returns({
        router: 'router.js'
      });

      emberRoutesDocumenter.main();

      assert.strictEqual(routerParser.getRoutesFromRouter.args[0][0], 'router.js');
    });
  });

  describe('getArgs', function() {
    beforeEach(function() {
      this.argv = process.argv;
    });

    afterEach(function() {
      process.argv = this.argv;
    });

    it('returns empty object if there are no arguments', function() {
      process.argv = ['node', 'documenter.js'];

      assert.deepEqual(emberRoutesDocumenter.getArgs(), {});
    });

    it('returns object with arguments found', function() {
      process.argv = ['node', 'documenter.js', 'router=someRouter.js'];

      var expected = {
        router: 'someRouter.js'
      };
      assert.deepEqual(emberRoutesDocumenter.getArgs(), expected);
    });
  });
});
