'use strict';

var proxyquire = require('proxyquire');
var assert = require('assert');
var sinon = require('sinon');

var routerParser = {
  getRoutesFromRouter: sinon.stub()
};

var fs = {
  writeFileSync: sinon.stub()
};

var path = {
  resolve: sinon.stub()
};

var emberRoutesDocumenter = proxyquire('../../../lib/emberRoutesDocumenter', {
  './routerParser': routerParser,
  'fs': fs,
  'path': path
});

describe('emberRoutesDocumenter', function() {
  describe('main', function() {
    beforeEach(function() {
      sinon.stub(emberRoutesDocumenter, 'getArgs');
    });

    afterEach(function() {
      emberRoutesDocumenter.getArgs.restore();
      routerParser.getRoutesFromRouter.returns().reset();
      fs.writeFileSync.returns().reset();
      path.resolve.reset();
    });

    it('calls getRoutesFromRouter with given router', function() {
      emberRoutesDocumenter.getArgs.returns({
        router: 'router.js'
      });
      path.resolve.withArgs('router.js').returns('/something/router.js');

      emberRoutesDocumenter.main();

      assert.strictEqual(
        routerParser.getRoutesFromRouter.args[0][0],
        '/something/router.js'
      );
    });

    it('writes documentation to file', function() {
      emberRoutesDocumenter.getArgs.returns({});
      routerParser.getRoutesFromRouter.returns('parsedRouter');

      emberRoutesDocumenter.main();

      var expected = ['routes_doc.json', JSON.stringify('parsedRouter')];
      assert.deepEqual(fs.writeFileSync.args[0], expected);
    });

    it('doesn\'t write to file if getRoutesFromRouter returns undefined', function() {
      emberRoutesDocumenter.getArgs.returns({});

      emberRoutesDocumenter.main();

      assert.strictEqual(fs.writeFileSync.called, false);
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
