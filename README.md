# ember-routes-parser

## What it does

Forked from ember-routes-documenter, ember-router-parser parses an Ember router
file and returns all of the routes in jSON format.

## How to use it

```
node bin/parser.js router={path to router}
```

It will generate a file called **routes_doc.json** in the current folder

#### TODO: Does not currently include @params in parsed jSON. 
