const gulp = require('gulp');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const clean = require('gulp-clean');

// 清理输出目录任务
function cleanOutput() {
  return gulp.src('out/egg-js', { allowEmpty: true, read: false })
    .pipe(clean())
    .on('end', () => {
      console.log('删除/out/egg-js文件成功！');
    });
}

// 混淆JS文件任务
function obfuscateJS() {
  return gulp.src([
    'app/**/*.js',
    'config/**/*.js',
  ], {
    base: '.',
  })
    .pipe(javascriptObfuscator({
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: false,
      stringArray: true,
      stringArrayEncoding: [ 'none' ],
      stringArrayThreshold: 0.75,
      target: 'node',
    }))
    .pipe(gulp.dest('out/egg-js/'))
    .on('end', () => {
      console.log('混淆加密成功！');
    });
}

// 复制非JS文件任务
function copyOtherFiles() {
  return gulp.src([
    'app/**/*',
    '!app/**/*.js',
  ], {
    base: '.',
  })
    .pipe(gulp.dest('out/egg-js/'))
    .on('end', () => {
      console.log('复制其他文件成功！');
    });
}

// 复制 package.json 任务
function copyPackageJSON() {
  return gulp.src('package.json')
    .pipe(gulp.dest('out/egg-js/'))
    .on('end', () => {
      console.log('复制package.json文件成功！');
    });
}

// 定义构建任务
gulp.task('build', gulp.series(cleanOutput, gulp.parallel(obfuscateJS, copyOtherFiles, copyPackageJSON)));
