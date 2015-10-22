'use strict';

var fs = require('fs');
var path = require('path');
var routerParser = require('./routerParser');

/**
 * Application entry point
 */
function main() {
  var args = exports.getArgs();
  var routes = routerParser.getRoutesFromRouter(path.resolve(args.router));
  if (routes) {
    fs.writeFileSync('routes_doc.json', JSON.stringify(routes));
  }
}

/**
 * Parses arguments from process.argv and returns them as an object.
 * Something like "node bin/documenter.js router=Hello.js" will be converted to
 * {
 *   router: 'Hello.js'
 * }
 * @returns {object} parsed - Parsed object
 */
function getArgs() {
  var parsed = {};
  var args = process.argv;

  if (args.length <= 2) {
    return parsed;
  }

  for (var i = 2; i < args.length; i++) {
    var current = args[i].split('=');

    if (current.length === 2) {
      parsed[current[0]] = current[1];
    }
  }

  return parsed;
}

exports.main = main;
exports.getArgs = getArgs;
