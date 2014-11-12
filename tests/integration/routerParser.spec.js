'use strict';

var routerParser = require('../../lib/routerParser');
var assert = require('assert');

describe('parseRouter', function() {
  it('parses routes and resources correctly', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.resource("hello");' +
        'this.route("dog", {path: "/cat"});' +
        'this.route("horse");' +
      '});';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      hello: {
        path: '/hello'
      },
      dog: {
        path: '/cat'
      },
      horse: {
        path: '/horse'
      }
    };
    assert.deepEqual(res, expected);
  });

  it('parses nested routes and resources correctly', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.resource("hello", function() {' +
          'this.route("world");' +
        '});' +
      '});';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      helloWorld: {
        path: '/hello/world'
      }
    };
    assert.deepEqual(res, expected);
  });

  it('parses deeply nested routes and resources correctly', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.resource("hello", function() {' +
          'this.resource("awesome", {path: "/awe/:some"}, function() {' +
            'this.route("tacos");' +
          '});' +
        '});' +
      '});';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      helloAwesomeTacos: {
        path: '/hello/awe/:some/tacos'
      }
    };
    assert.deepEqual(res, expected);
  });

  it('parses complete router code', function() {
    var routerCode =
      'import Ember from "ember";' +
      'var Router = Ember.Router.extend({' +
        'location: FooENV.locationType' +
      '});' +
      'Router.map(function() {' +
        'this.resource("index");' +
        'this.route("post");' +
        'this.resource("book", {path: "/foo"});' +
        'this.resource("car", function() {' +
          'this.route("new");' +
          'this.resource("baz", function() {' +
            'this.route("boo");' +
            'this.resource("fizz", function() {' +
              'this.route("dog")' +
            '})' +
          '});' +
        '});' +
        'this.resource("cat", function() {' +
          'this.route("lion")' +
        '})' +
      '});' +
      'export default Router;';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      index: {
        path: '/index'
      },
      post: {
        path: '/post'
      },
      book: {
        path: '/foo'
      },
      carNew: {
        path: '/car/new'
      },
      carBazBoo: {
        path: '/car/baz/boo'
      },
      carBazFizzDog: {
        path: '/car/baz/fizz/dog'
      },
      catLion: {
        path: '/cat/lion'
      }
    };
    assert.deepEqual(res, expected);
  });
});
