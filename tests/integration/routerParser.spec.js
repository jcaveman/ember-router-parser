'use strict';

var routerParser = require('../../lib/routerParser');
var assert = require('assert');
var path = require('path');

describe('routerParser(integration)', function() {
  describe('getRoutesFromRouter', function() {
    it('parses router from file', function() {
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

    it('parses only annotated routes and resources', function() {
      var routerCode =
        'App.Router.map(function() {' +
          '/**\n' +
          ' * @documentUrl\n' +
          ' */\n' +
          'this.resource("hello");\n' +
          '// @documentUrl\n' +
          'this.route("dog", {path: "/cat"});' +
          '// @cccc\n' +
          'this.route("horse");' +
          'this.route("chicken");' +
        '});';
      var options = {
        onlyAnnotated: true
      };

      var res = routerParser.parseRouter(routerCode, options);

      assert.strictEqual(res.horse, undefined);
      assert.strictEqual(res.chicken, undefined);
      assert.strictEqual(res.hello.path, '/hello');
      assert.strictEqual(res.dog.path, '/cat');
    });

    it('parses only annotated routes and resources when nested', function() {
      var routerCode =
        'App.Router.map(function() {\n' +
          '// hello, can you @documentUrl\n' +
          'this.resource("post", { path: "/post/:post_id" }, function() {\n' +
            'this.route("edit");\n' +
            'this.resource("comments", function() {\n' +
              '/**\n' +
              ' * @documentUrl\n' +
              ' */\n' +
              'this.route("new");\n' +
              'this.route("mocos");\n' +
            '});\n' +
          '});\n' +
        '});\n';
      var options = {
        onlyAnnotated: true
      };

      var res = routerParser.parseRouter(routerCode, options);

      assert.strictEqual(res.postEdit, undefined);
      assert.strictEqual(res.postCommentsMocos, undefined);
      assert.strictEqual(res.post.path, '/post/:post_id');
      assert.strictEqual(res.postCommentsNew.path, '/post/:post_id/comments/new');
    });
  });

  it('parses route comments', function() {
    var routerCode =
      'App.Router.map(function() {\n' +
      '  /**\n' +
      '   * This route will give you a nice page with a blog post\n' +
      '   * @param post_id Id of the post you want to see\n' +
      '   */\n' +
      '  this.resource("post", { path: "/post/:post_id" }, function() {\n' +
      '    /**\n' +
      '     * Edit a blog post\n' +
      '     */\n' +
      '    this.route("edit");\n' +
      '    /**\n' +
      '     * View comments from a blog post\n' +
      '     */\n' +
      '    this.resource("comments", function() {\n' +
      '      /**\n' +
      '       * Create a new comment on a blog post\n' +
      '       */\n' +
      '      this.route("new");\n' +
      '    });\n' +
      '  });\n' +
      '});';

    var res = routerParser.parseRouter(routerCode);

    var expected = {
      'post': {
        'path': '/post/:post_id',
        'doc': 'This route will give you a nice page with a blog post',
        'params': {
          'post_id': 'Id of the post you want to see'
        }
      },
      'postEdit': {
        'path': '/post/:post_id/edit',
        'doc': 'Edit a blog post',
        'params': {
          'post_id': 'Id of the post you want to see'
        }
      },
      'postComments': {
        'path': '/post/:post_id/comments',
        'doc': 'View comments from a blog post',
        'params': {
          'post_id': 'Id of the post you want to see'
        }
      },
      'postCommentsNew': {
        'path': '/post/:post_id/comments/new',
        'doc': 'Create a new comment on a blog post',
        'params': {
          'post_id': 'Id of the post you want to see'
        }
      }
    };
    assert.deepEqual(res, expected);
  });
});
