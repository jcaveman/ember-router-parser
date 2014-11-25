[![Build Status](https://travis-ci.org/soonick/ember-routes-documenter.svg?branch=master)](https://travis-ci.org/soonick/ember-routes-documenter)

# ember-routes-documenter

## What it does

Parses ember routes to make them easy to document. This plugin was created with
the intention of documenting routes, you can add information about the routes in
a comment right on top of the route you are documenting. You can use @param to
document a specific parameter. Here is an example:

Given a router like this:

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
node bin/documenter.js router=<router>
```

**router** - Path to the router we will document

It will generate a file called **routes_doc.json** in the current folder
