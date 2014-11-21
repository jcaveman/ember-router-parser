'use strict';

module.exports = function(grunt) {
  /**
   * This function grabs all files under the given path and uses them as
   * configurations for grunt tasks
   * @params {string} path - Path were configuration files live
   */
  function loadConfig(path) {
    var object = {};
    var key;

    var files = grunt.file.expand({cwd: path}, '*');
    files.forEach(function(option) {
      key = option.replace(/\.js$/, '');
      object[key] = require(path + option);
    });

    return object;
  }

  grunt.initConfig(loadConfig('./config/grunt/'));

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('health', ['eslint', 'mochaTest']);
};
