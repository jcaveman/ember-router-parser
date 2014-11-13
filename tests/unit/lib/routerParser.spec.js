'use strict';

var routerParser = require('../../../lib/routerParser');
var assert = require('assert');
var esprima = require('esprima');
var sinon = require('sinon');
var fs = require('fs');

describe('getRoutesFromRouter', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'parseRouter');
    this.sb.stub(fs, 'readFileSync');
    this.sb.stub(console, 'error');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('calls parseRouter with the result of reading the file in the given path', function() {
    fs.readFileSync.returns('some content');

    routerParser.getRoutesFromRouter('/some/path');

    assert.strictEqual(routerParser.parseRouter.args[0][0], 'some content');
  });

  it('returns result from parseRouter', function() {
    routerParser.parseRouter.returns('parsed');

    assert.strictEqual(routerParser.getRoutesFromRouter('/some/path'), 'parsed');
  });

  it('logs error if unable to open file', function() {
    fs.readFileSync.throws();

    routerParser.getRoutesFromRouter('hello');

    assert.ok(console.error.calledOnce);
  });
});

describe('parseRouter', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'getRouterMapBody');
    this.sb.stub(routerParser, 'parseExpressionStatement');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('returns null if getRouterMapBody returns null', function() {
    var parsed = routerParser.parseRouter('someRouterCode');

    assert.strictEqual(parsed, null);
  });

  it('calls parseExpressionStatement for all expressions', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.route("hello");' +
        'this.resource("world");' +
      '});';
    var ast = esprima.parse(routerCode);
    routerParser.getRouterMapBody.returns(ast.body[0].expression.arguments[0].body);

    routerParser.parseRouter(routerCode);

    assert.strictEqual(routerParser.parseExpressionStatement.callCount, 2);
  });
});

describe('parseExpressionStatement', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'addRoute');
    this.sb.stub(routerParser, 'addResource');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('calls addRoute when the expression is called in a route', function() {
    var routes = {};
    var expression = {
      expression: {
        callee: {
          property: {
            name: 'route'
          }
        }
      }
    };

    routerParser.parseExpressionStatement(expression, routes);

    assert.deepEqual(routerParser.addRoute.args[0], [expression, routes]);
  });

  it('calls addResource when the expression is called in resource', function() {
    var routes = {};
    var expression = {
      expression: {
        callee: {
          property: {
            name: 'resource'
          }
        }
      }
    };

    routerParser.parseExpressionStatement(expression, routes);

    assert.deepEqual(routerParser.addResource.args[0], [expression, routes]);
  });
});

describe('addResource', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'addRoute');
    this.sb.stub(routerParser, 'parseExpressionStatement');
    this.sb.stub(routerParser, 'buildPrefix');
    this.sb.stub(routerParser, 'mergeObjects');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('uses addRoute to parse resource with no callback', function() {
    var routerCode = 'this.resouce("hello");';
    var ast = esprima.parse(routerCode).body[0];
    var prefix = {};

    routerParser.addResource(ast, prefix);

    assert.strictEqual(routerParser.addRoute.args[0][0], ast);
    assert.strictEqual(routerParser.addRoute.args[0][1], prefix);
  });

  it('uses addRoute to parse resource with path and no callback', function() {
    var routerCode = 'this.resource("hello", {asdf: "qwer", path: "/some/path"});';
    var ast = esprima.parse(routerCode).body[0];
    var prefix = {};

    routerParser.addResource(ast, prefix);

    assert.strictEqual(routerParser.addRoute.args[0][0], ast);
    assert.strictEqual(routerParser.addRoute.args[0][1], prefix);
  });

  it('returns result of addRoute if resource with no callback', function() {
    var routerCode = 'this.resouce("hello");';
    var ast = esprima.parse(routerCode).body[0];
    routerParser.addRoute.returns('someRoutes');

    var routes = routerParser.addResource(ast);

    assert.strictEqual(routes, 'someRoutes');
  });

  it('doesn\'t call addRoute if there is a callback as the last argument', function() {
    var routerCode = 'this.resource("hello", {hello: "world"}, function() {});';
    var ast = esprima.parse(routerCode).body[0];

    routerParser.addResource(ast);

    assert.ok(!routerParser.addRoute.called);
  });

  it('parses resource with routes correctly', function() {
    var routerCode = 'this.resource("hello", function() {' +
      'this.route("new");' +
      'this.route("edit");' +
    '});';
    var ast = esprima.parse(routerCode).body[0];

    routerParser.addResource(ast);

    var args = routerParser.parseExpressionStatement.args;
    assert.strictEqual(args[0][0].expression.arguments[0].value, 'new');
    assert.strictEqual(args[1][0].expression.arguments[0].value, 'edit');
  });

  it('parses resource with path and routes correctly', function() {
    var routerCode = 'this.resource("hello", {path: "/some/thing"}, function() {' +
      'this.route("new");' +
      'this.route("edit");' +
    '});';
    var ast = esprima.parse(routerCode).body[0];

    routerParser.addResource(ast);

    var args = routerParser.parseExpressionStatement.args;
    assert.strictEqual(args[0][0].expression.arguments[0].value, 'new');
    assert.strictEqual(args[1][0].expression.arguments[0].value, 'edit');
  });

  it('builds prefix before calling parseExpressionStatement', function() {
    var routerCode = 'this.resource("hello", function() {' +
      'this.route("edit");' +
    '});';
    var ast = esprima.parse(routerCode).body[0];
    routerParser.buildPrefix.returns('builtPrefix');

    routerParser.addResource(ast, 'prefix');

    assert.strictEqual(routerParser.buildPrefix.args[0][0], ast);
    assert.strictEqual(routerParser.buildPrefix.args[0][1], 'prefix');
    assert.strictEqual(
      routerParser.parseExpressionStatement.args[0][1],
      'builtPrefix'
    );
  });

  it('merges routes with parseExpressionStatement result', function() {
    var routerCode = 'this.resource("hello", function() {' +
      'this.route("edit");' +
    '});';
    var ast = esprima.parse(routerCode).body[0];
    routerParser.addRoute.returns('parsedRoute');
    routerParser.parseExpressionStatement.returns('parsedExpression');

    var routes = routerParser.addResource(ast, 'prefixExpression');

    assert.strictEqual(routerParser.mergeObjects.args[0][0], routes);
    assert.strictEqual(routerParser.mergeObjects.args[0][1], 'parsedRoute');
    assert.strictEqual(routerParser.mergeObjects.args[1][0], routes);
    assert.strictEqual(routerParser.mergeObjects.args[1][1], 'parsedExpression');
  });
});

describe('addRoute', function() {
  it('parses route', function() {
    var routerCode = 'this.route("hello");';
    var ast = esprima.parse(routerCode).body[0];

    var routes = routerParser.addRoute(ast);

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

    var routes = routerParser.addRoute(ast);

    var expected = {
      hello: {
        path: '/some/path'
      }
    };
    assert.deepEqual(routes, expected);
  });

  it('uses prefixes when building route', function() {
    var routerCode = 'this.route("hello");';
    var ast = esprima.parse(routerCode).body[0];
    var prefix = {
      name: 'tacos',
      path: '/ta/quito'
    };

    var routes = routerParser.addRoute(ast, prefix);

    var expected = {
      tacosHello: {
        path: '/ta/quito/hello'
      }
    };
    assert.deepEqual(routes, expected);
  });

  it('parses resource with callback as route', function() {
    var routerCode = 'this.resource("hello", function() {});';
    var ast = esprima.parse(routerCode).body[0];

    var routes = routerParser.addRoute(ast);

    var expected = {
      hello: {
        path: '/hello'
      }
    };
    assert.deepEqual(routes, expected);
  });

  it('parses rosource with path and callback as route', function() {
    var routerCode = 'this.resource("hello", {path: "/a"}, function() {});';
    var ast = esprima.parse(routerCode).body[0];

    var routes = routerParser.addRoute(ast);

    var expected = {
      hello: {
        path: '/a'
      }
    };
    assert.deepEqual(routes, expected);
  });
});

describe('getRouterMapBody', function() {
  it('returns undefined if map is not found', function() {
    var routerCode =
      'import Ember from "ember";' +
      'var Router = Ember.Router.extend({' +
        'location: FooENV.locationType' +
      '});' +
      'export default Router;';
    var ast = esprima.parse(routerCode);

    var map = routerParser.getRouterMapBody(ast);

    assert.strictEqual(map, undefined);
  });

  it('returns map body if found', function() {
    var routerCode =
      'import Ember from "ember";' +
      'var Router = Ember.Router.extend({' +
        'location: FooENV.locationType' +
      '});' +
      'Router.map(function() {});' +
      'export default Router;';
    var ast = esprima.parse(routerCode);

    var map = routerParser.getRouterMapBody(ast);

    assert.strictEqual(map.type, 'BlockStatement');
  });
});

describe('buildPrefix', function() {
  beforeEach(function() {
    this.sb = sinon.sandbox.create();
    this.sb.stub(routerParser, 'getPropertyValue');
  });

  afterEach(function() {
    this.sb.restore();
  });

  it('uses value if there is no previous prefix and path', function() {
    var routerCode = 'this.route("hello");';
    var ast = esprima.parse(routerCode).body[0];

    var newPrefix = routerParser.buildPrefix(ast);

    var expected = {
      name: 'hello',
      path: '/hello'
    };
    assert.deepEqual(newPrefix, expected);
  });

  it('uses path if there was one specified', function() {
    var routerCode = 'this.route("hello", {path: "/a/b"});';
    var ast = esprima.parse(routerCode).body[0];
    routerParser.getPropertyValue.returns('/a/b');

    var newPrefix = routerParser.buildPrefix(ast);

    var expected = {
      name: 'hello',
      path: '/a/b'
    };
    assert.deepEqual(newPrefix, expected);
  });

  it('uses path if there is a path and a callback', function() {
    var routerCode = 'this.resource("hello", {path: "/a/b"}, function() {' +
      'this.route("asdf");' +
    '});';
    var ast = esprima.parse(routerCode).body[0];
    routerParser.getPropertyValue.returns('/a/b');

    var newPrefix = routerParser.buildPrefix(ast);

    var expected = {
      name: 'hello',
      path: '/a/b'
    };
    assert.deepEqual(newPrefix, expected);

  });

  it('extends previous prefix values if they existed', function() {
    var routerCode = 'this.route("hello");';
    var ast = esprima.parse(routerCode).body[0];
    var prefix = {
      name: 'jose',
      path: '/sanchez'
    };

    var newPrefix = routerParser.buildPrefix(ast, prefix);

    var expected = {
      name: 'joseHello',
      path: '/sanchez/hello'
    };
    assert.deepEqual(newPrefix, expected);
  });
});

describe('getPropertyValue', function() {
  it('returns value of the property if found', function() {
    var object = 'var a = {hello: "world", bye: "universe"}';
    var ast = esprima.parse(object).body[0].declarations[0].init;

    var actual = routerParser.getPropertyValue(ast, 'bye');

    assert.strictEqual(actual, 'universe');
  });

  it('returns undefined if property not found', function() {
    var object = 'var a = {hello: "world", bye: "universe"}';
    var ast = esprima.parse(object).body[0].declarations[0].init;

    var actual = routerParser.getPropertyValue(ast, 'no');

    assert.ok(!actual);
  });
});

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

    routerParser.mergeObjects(o1, o2);

    var expected = {
      hello: 'world',
      bye: 'jose',
      taco: 'salsa'
    };
    assert.deepEqual(o1, expected);
  });
});
