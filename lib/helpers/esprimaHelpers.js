'use strict';

/**
 * Finds the a value inside an ObjectExpression properties
 * @param {object} objectExpression - esprima ObjectExpression
 * @param {string} key - The key we are looking for inside the properties
 * @returns {string} val - The value or undefined if not found
 */
exports.getPropertyValue = function(objectExpression, key) {
  var i;
  var property;

  for (i in objectExpression.properties) {
    property = objectExpression.properties[i];
    if (property.key.name === key) {
      return property.value.value;
    }
  }
};
