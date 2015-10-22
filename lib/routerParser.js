var esprima = require('esprima');
var fs = require('fs');
var helpers = require('./helpers/helpers');

var resursiveCallStackCount = 0;
var routeCount = 0;

/**
 * routeParser entry point. Opens route file, calls parser, catches errors
 */
function getRoutesFromRouter(router) {
  try {
    return parseRouterFile(fs.readFileSync(router));
  } catch (e) {
    console.error(e);
  }
};

/**
 * Parses route file into an object using Esprima parser, then passes that
 * object to recursive function walkParsedRouter to walk its properties and
 * find routes.
 */
function parseRouterFile(router) {
  var parsedRouter = esprima.parse(router, {comment: true, loc: true});
  var routes = walkParsedRouter(parsedRouter.body);
  console.log(routeCount + ' routes found!');
  return routes;
};

/**
 * a recursive function that "walks" through all of the properties of
 * the supplied object looking for Ember routes. This function is not
 * directly recursive (it doesn't call itself), rather it delegates 
 * recursion to the "iterate" function for cleaner code.
 */
function walkParsedRouter(obj, route, routes) {
  var routes = routes || {};
  var route = route || {
    path: '/',
    alias: ''
  };

  for (var key in obj) {
    var property = obj[key];

    if (helpers.isARoute(property)) {
      var newRoute = getRouteDataFromObject(property, route);
      if (newRoute) {
        route = newRoute;
        routes[route.alias] = { path: route.path }
        routeCount++;
      }
    }

    iterate(property, route, routes); // handles the recursive call of walkParsedRouter
  }

  return routes;
}

/**
 * This nasty mess takes an Esprima route object and pulls out the relevant 
 * data. Esprima objects are heavily nested, hence the nested conditionals
 * and loops. This implementation is made to be as flexible as possible but
 * if Ember route APIs change much this will likey need to be refactored.
 */
function getRouteDataFromObject(obj, originalRoute) {
  var result = {
    alias: helpers.concatenateAlias(originalRoute.alias, obj.arguments[0].value)
  };
  if (obj.arguments.length > 1) {

    for (key in obj.arguments) {
      var argument = obj.arguments[key];

      if (argument.properties) {
        for (key in argument.properties) {
          var property = argument.properties[key];
          if (property.key && property.key.name && property.key.name === "path") {
            if (property.value.value === '/') {
              return false;
            }
            result.path = helpers.concatenatePath(originalRoute.path, property.value.value);
            return result;
          }
        }
      }

    }

  }
  result.path = helpers.concatenatePath(originalRoute.path, obj.arguments[0].value);
  return result;
}

/**
 * handles the recursive calling of walkParsedRouter. Implements a hack
 * to prevent "Maximum call stack" error and ensure we "walk" through
 * the entire object tree.
 */
function iterate(obj, route, routes) {
  if (typeof obj === 'object') {
    resursiveCallStackCount++;
    if (resursiveCallStackCount > 9000) {
      resursiveCallStackCount = 0;
      // we can't just use setImmediate every time because it causes the
      // iterator to stop before it's parsed the entire Esprima object.
      setImmediate(function() {
        walkParsedRouter(obj, route, routes);
      });
    } else {
      // iterating this way will eventually throw a "Maximum call stack
      // size exceeded" error. Have to break it up with setImmediate
      // every 9000 iterations
      walkParsedRouter(obj, route, routes);
    }
  }
}

exports.getRoutesFromRouter = getRoutesFromRouter;