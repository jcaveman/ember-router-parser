# ember-routes-parse

## What it does

Forked from ember-routes-documenter, ember-routes-parser parses an Ember router
file and returns all of the routes in jSON format.

## How to use it

```
node bin/parser.js router=<router>
```

**router** - Path to the router we will document

It will generate a file called **routes_doc.json** in the current folder
