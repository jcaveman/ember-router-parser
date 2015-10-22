'use strict';

/*
 * merges arg2 onto arg1 to form a valid path, removing extra slashes
 * caused by the merge
 */
exports.concatenatePath = function(originalPath, newPath) {
  var result = originalPath + '/' + newPath;
  return result.replace('///', '/').replace('//', '/');
}

/*
 * merges newAlias onto originalAlias separated by "." as necessary.
 */
exports.concatenateAlias = function(originalAlias, newAlias) {
  return originalAlias === '' ? newAlias: originalAlias + '.' + newAlias;
}

/*
 * returns true if supplied object is a route definition, false if not
 */
exports.isARoute = function(obj) {
  return obj
      && obj.callee
      && obj.callee.property
      && obj.callee.property.name
      && obj.callee.property.name === 'route';
}