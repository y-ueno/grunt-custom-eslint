#
# grunt-custom-eslint
# https:#github.com/y-ueno/grunt-custom-eslint
#
# Copyright  c) 2015 Yusuke Ueno
# Licensed under the MIT license.
#

module.exports =  (grunt) ->
  require('jit-grunt') grunt,
    replace: 'grunt-text-replace'

  # Project configuration.
  grunt.initConfig
    jshint:
      all:
        'tasks/*.js'
      options:
        jshintrc: '.jshintrc'

    # Before generating any new files, remove any previously-created files.
    clean:
      tests: ['tmp']

    # Configuration to be run  and then tested).
    custom_eslint:
      options:
        configFile: '.eslintrc'
        force: true
        outputFile: 'result.txt'
      target: [
        './*.js'
      ]

    # Unit tests.
    nodeunit:
      tests: ['test/*_test.js']

    #
    exec:
      test:
        cmd: 'ls -al'

  # Actually load this plugin's task s).
  grunt.loadTasks 'tasks'

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'

  # Whenever the "test" task is run, first clean the "tmp" dir, then run this
  # plugin's task s), then test the result.
  grunt.registerTask 'test', ['clean', 'custom_eslint', 'nodeunit']

  # By default, lint and run all tests.
  grunt.registerTask 'default', ['jshint', 'test']
  grunt.registerTask 'custom-eslint', ['custom_eslint'];
