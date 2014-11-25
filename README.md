[![Build Status](https://travis-ci.org/soonick/ember-routes-documenter.svg?branch=master)](https://travis-ci.org/soonick/ember-routes-documenter)

# ember-routes-documenter

## What it does

Parses ember routes to make them easy to document.

Given a router like this:

```JavaScript
App.Router.map(function() {
  this.resource('post', { path: '/post/:post_id' }, function() {
    this.route('edit');
    this.resource('comments', function() {
      this.route('new');
    });
  });
});
```

And some controllers:

```JavaScript
App.PostController = Ember.ObjectController.extend({
  queryParams: ['awesomeness_level', 'color'],
  awesomenessLevel: null,
  color: null
});

App.CommentsController = Ember.ArrayController.extend({
  queryParams: ['page'],
  page: null
});
```

It will generate this output:

```JavaScript
{
  "post": {
    "path": "post/:post_id",
    "queryParams": ["awesomeness_level", "color"]
  },
  "postEdit": {
    "path": "post/:post_id/edit",
    "queryParams": ["awesomeness_level", "color"]
  },
  "postComments": {
    "path": "post/:post_id/comments",
    "queryParams": ["awesomeness_level", "color", "page"]
  },
  "postCommentsNew": {
    "path": "post/:post_id/comments/new",
    "queryParams": ["awesomeness_level", "color", "page"]
  },
}
```

## Adding route information

Since this plugin was created with the intention of documenting routes, you can
add information about the route in a comment right on top of the route you are
documenting. You can use @param to document a specific parameter. Here is an
example:

```JavaScript
App.Router.map(function() {
  /**
   * This route will give you a nice page with a blog post
   * @param post_id Id of the post you want to see
   */
  this.resource('post', { path: '/post/:post_id' }, function() {
    /**
     * Edit a blog post
     */
    this.route('edit');
    /**
     * View comments from a blog post
     */
    this.resource('comments', function() {
      /**
       * Create a new comment on a blog post
       */
      this.route('new');
    });
  });
});
```

Will give this output:

```JavaScript
{
  "post": {
    "path": "post/:post_id",
    "doc": "This route will give you a nice page with a blog post",
    "params": {
      "post_id": "Id of the post you want to see"
    }
  },
  "postEdit": {
    "path": "post/:post_id/edit",
    "doc": "Edit a blog post",
    "params": {
      "post_id": "Id of the post you want to see"
    }
  },
  "postComments": {
    "path": "post/:post_id/comments",
    "doc": "View comments from a blog post",
    "params": {
      "post_id": "Id of the post you want to see"
    }
  },
  "postCommentsNew": {
    "path": "post/:post_id/comments/new",
    "doc": "Create a new comment on a blog post",
    "params": {
      "post_id": "Id of the post you want to see"
    }
  },
}
```

## How to use it

```
node bin/documenter.js router=<router> [routes=<routes>]
```

**router** - Path to the router we will document

**routes** - Path where the routes files live

It will generate a file called **documenter.json** in the current folder
