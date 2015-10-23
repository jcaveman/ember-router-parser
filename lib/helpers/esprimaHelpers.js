'use strict';

/**
 * Finds the a value inside an Esprima Ember object
 * @param {object} - esprima object
 * @param {string} key - The key we are looking for inside the properties
 * @returns {string} val - The value or undefined if not found
 */
exports.getPropertyValue = function(object, key) {
  var i;
  var property;

  if (object.properties) {
    for (i in object.properties) {
      property = object.properties[i];
      if (property && property.key && property.key.name && property.key.name === key) {
        return property.value.value
      }
    }
  }

  return;
};