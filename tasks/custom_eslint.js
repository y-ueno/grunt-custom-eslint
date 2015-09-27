/*
 * grunt-custom-eslint
 * https://github.com/y-ueno/grunt-custom-eslint
 *
 * Copyright (c) 2015 Yusuke Ueno
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('custom_eslint', 'grunt-custom-eslint', function() {
    var CLIEngine = require('eslint').CLIEngine;
    var execSync = require('child_process').execSync;
    var path = require('path');
    var fs = require('fs');
    var eslint;
    var response;
    var formatter;
    var report;
    var errorCode = 1;
    var done = this.async();
    var options = this.options({
      'silent': false,
      'quiet': false,
      'maxWarnings': -1,
      'format': 'unix',
      'callback': 'false',
      'resultDir': './result/',
      'outputFile': 'result.txt',
      'baseFile': 'base.txt'
    });

    if(this.filesSrc.length === 0){
      return console.log('No Files specified');
    }

    try {
      eslint = new CLIEngine(options);
      response = eslint.executeOnFiles(this.filesSrc);
    } catch (err) {
      grunt.warn(err);
      return;
    }

    if(options.callback && options.callback.constructor === Function){
      return options.callback(response);
    }

    formatter = eslint.getFormatter(options.format);

    if (!formatter) {
      grunt.warn("Formatter " + options.format + " not found");
      return;
    }

    if (options.quiet) {
      response.results = CLIEngine.getErrorResults(response.results);
    }

    // Unix形式で結果を出力
    report = formatter(response.results);

    if (!fs.existsSync(options.resultDir + options.baseFile)) {
      grunt.log.subhead('creating initial result file');
      grunt.file.write(options.resultDir + options.baseFile, report);
    }
    // ファイルが存在する場合
    if (fs.existsSync(options.resultDir + options.outputFile)) {
        grunt.file.delete(options.resultDir + options.outputFile);
    }
    grunt.file.write(options.resultDir + options.outputFile, report);

    // ファイルの行数を比較する
    var resultErrorNum = "" + execSync('cat result/result.txt | grep -c ""');
    var baseErrorNum = "" + execSync('cat result/base.txt | grep -c ""');

    // 初期のエラー数より増えていたらエラーを出力
    if (resultErrorNum - baseErrorNum > 0) {
      var diff = grunt.util.spawn({
        cmd: 'diff',
        args: ['-u', '-b', 'result/base.txt', 'result/result.txt']
      }, function(error, result, code) {
        if (result.stderr) {
          // コマンド実行失敗
          grunt.log.errorlns(error);
        } else {
          if (result.stdout) {
            grunt.log.errorlns(result.stdout);
            grunt.fail.warn('syntax error or coding violations', errorCode);
          } else {
            grunt.log.ok( 'ok, no syntax error and no coding violations');
          }
        }
      });
    }
    grunt.log.ok( 'ok, no syntax error and no coding violations');
    
    if(options.silent){
      return true;
    }
    else if(options.maxWarnings > -1 && response.warningCount > options.maxWarnings){
      return false;
    }
    else{
      return response.errorCount === 0;
    }
  });

};
