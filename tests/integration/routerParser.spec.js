'use strict';

var routerParser = require('../../lib/routerParser');
var assert = require('assert');
var path = require('path');

describe('getRoutesFromRouter', function() {
    var fixture = path.join(__dirname, 'fixtures/router.js');
    var res = routerParser.getRoutesFromRouter(fixture);

    var expected = {
      post: {
        path: '/post/:post_id'
      },
      postEdit: {
        path: '/post/:post_id/edit'
      },
      postComments: {
        path: '/post/:post_id/comments'
      },
      postCommentsNew: {
        path: '/post/:post_id/comments/new'
      }
    };
    assert.deepEqual(res, expected);
});

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
      hello: {
        path: '/hello'
      },
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
      hello: {
        path: '/hello'
      },
      helloAwesome: {
        path: '/hello/awe/:some'
      },
      helloAwesomeTacos: {
        path: '/hello/awe/:some/tacos'
      }
    };
    assert.deepEqual(res, expected);
  });

  it('parses complete router code', function() {
    var routerCode =
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
      '});';

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
      car: {
        path: '/car'
      },
      carNew: {
        path: '/car/new'
      },
      carBaz: {
        path: '/car/baz'
      },
      carBazBoo: {
        path: '/car/baz/boo'
      },
      carBazFizz: {
        path: '/car/baz/fizz'
      },
      carBazFizzDog: {
        path: '/car/baz/fizz/dog'
      },
      cat: {
        path: '/cat'
      },
      catLion: {
        path: '/cat/lion'
      }
    };
    assert.deepEqual(res, expected);
  });

  it('parses routes with place holders', function() {
    var routerCode =
      'App.Router.map(function() {' +
        'this.resource("post", { path: "/post/:post_id" }, function() {' +
          'this.route("edit");' +
          'this.resource("comments", function() {' +
            'this.route("new");' +
          '});' +
        '});' +
      '});';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      post: {
        path: '/post/:post_id'
      },
      postEdit: {
        path: '/post/:post_id/edit'
      },
      postComments: {
        path: '/post/:post_id/comments'
      },
      postCommentsNew: {
        path: '/post/:post_id/comments/new'
      }
    };
    assert.deepEqual(res, expected);
  });
});
