'use strict';

/**
 * Copies attributues from o2 to o1. Attributes from o1 will be overwritten if
 * they already exist
 * @param {object} o1 - Object where the attributes will be copied
 * @param {object} o2 - Attributes will be taken from this object
 */
exports.mergeObjects = function(o1, o2) {
  var i;
  for (i in o2) {
    o1[i] = o2[i];
  }
};
