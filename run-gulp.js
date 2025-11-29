const gulp = require('gulp');
const { log } = require('gulp-clean/utils');
const path = require('path');

// 动态加载所有 Gulp 任务文件
const gulpfile = path.resolve(__dirname, 'gulpfile.js');
require(gulpfile);

// 执行 'build' 任务
log.info('正在构建...');
gulp.series('build')();
