'use strict';

var routerParser = require('../../../lib/routerParser');
var assert = require('assert');
var esprima = require('esprima');
var sinon = require('sinon');

describe('getRoutesFromRouter', function() {
  it('calls parseRouter with given path', function() {

  });
});

describe('parseRouter', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'getRouterMapBody');
    this.sb.stub(routerParser, 'addRoute');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('returns null if getRouterMapBody returns null', function() {
    var parsed = routerParser.parseRouter('someRouterCode');

    assert.strictEqual(parsed, null);
  });

  it('calls add route for all routes', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.route("hello");' +
        'this.route("world");' +
      '});';
    var ast = esprima.parse(routerCode);
    routerParser.getRouterMapBody.returns(ast.body[0].expression.arguments[0].body);

    routerParser.parseRouter(routerCode);

    assert.strictEqual(routerParser.addRoute.callCount, 2);
  });
});

describe('addRoute', function() {
  it('parses route', function() {
    var routerCode = 'this.route("hello");';
    var ast = esprima.parse(routerCode).body[0];

    var routes = {};
    routerParser.addRoute(ast, routes);

    var expected = {
      hello: {
        path: '/hello'
      }
    };
    assert.deepEqual(routes, expected);
  });

  it('parses route with path', function() {
    var routerCode = 'this.route("hello", {asdf: "qwer", path: "/some/path"});';
    var ast = esprima.parse(routerCode).body[0];

    var routes = {};
    routerParser.addRoute(ast, routes);

    var expected = {
      hello: {
        path: '/some/path'
      }
    };
    assert.deepEqual(routes, expected);
  });
});

describe('getRouterMapBody', function() {
  beforeEach(function() {
    sinon.stub(routerParser, 'findInAst');
  });

  afterEach(function() {
    routerParser.findInAst.restore();
  });

  it('returns undefined if CallExpression is not found', function() {
    routerParser.findInAst.returns(null);

    var map = routerParser.getRouterMapBody({});

    assert.strictEqual(map, undefined);
  });

  it('returns undefined if map property is not found', function() {
    routerParser.findInAst.returns({
      callee: {
        property: {
          name: 'something'
        }
      }
    });

    var map = routerParser.getRouterMapBody({});

    assert.strictEqual(map, undefined);
  });

  it('returns first argument if map property is found', function() {
    routerParser.findInAst.returns({
      callee: {
        property: {
          name: 'map'
        }
      },
      arguments: [{body: 'theBody'}]
    });

    var map = routerParser.getRouterMapBody({});

    assert.strictEqual(map, 'theBody');
  });
});

describe('findInAst', function() {
  it('finds the first "CallExpression" inside of AST', function() {
    var ast = esprima.parse('App.Router.map(function(){});');

    var found = routerParser.findInAst('CallExpression', ast);

    assert.strictEqual(found.type, 'CallExpression');
  });

  it('returns empty object if there is not "CallExpression"', function() {
    var ast = esprima.parse('var x = t + 5;');

    var found = routerParser.findInAst('CallExpression', ast);

    assert.strictEqual(found, null);
  });
});
