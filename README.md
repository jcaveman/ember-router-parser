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

## How to use it

```
node bin/documenter.js router [routes]
```

**router** - Path to the router we will document

**routes** - Path where the routes files live

It will generate a file called **documenter.json** in the current folder
