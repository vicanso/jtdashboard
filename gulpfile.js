var gulp = require('gulp');
var path = require('path');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var base64 = require('gulp-base64');
var cssmin = require('gulp-cssmin');
var _ = require('lodash');
var nib = require('nib');
var copy = require('gulp-copy');
var del = require('del');
var path = require('path');
var through = require('through');
var bufferCrc32 = require('buffer-crc32');
var fs = require('fs');
var moment = require('moment');
gulp.task('jshint', ['clean:dest'], function(){
  var srcList = [
    '*.js',
    'controllers/*.js', 
    'helpers/*.js', 
    'middlewares/*.js',
    'statics/src/**/*.js',
    '!statics/src/component/*.js'
  ];
  return gulp.src(srcList)
    .pipe(jshint({
      predef : [],
      node : true
    }))
    .pipe(jshint.reporter('default'));
});


gulp.task('clean:dest', function(cbf){
  del(['statics/dest'], cbf);
});

gulp.task('clean:build', ['static_version'], function(cbf){
  del(['statics/build'], cbf);
});


gulp.task('static_stylus', ['clean:dest'], function(){
  return gulp.src('statics/src/**/*.styl')
    .pipe(stylus({
      use : nib(),
      compress : true
    }))
    .pipe(base64())
    .pipe(cssmin())
    .pipe(gulp.dest('statics/build'));
});

gulp.task('static_css', ['clean:dest'], function(){
  return gulp.src(['statics/src/**/*.css'])
    .pipe(cssmin())
    .pipe(gulp.dest('statics/build'));
});


gulp.task('static_js', ['clean:dest'], function(){
  return gulp.src('statics/src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('statics/build'));
});

gulp.task('static_copy_other', ['clean:dest'], function(){
  return gulp.src(['statics/**/*', '!statics/**/*.js', '!statics/**/*.styl', '!statics/**/*.css', '!statics/**/*.js'])
    .pipe(copy('statics/dest', {
      prefix : 2
    }));
});

var concatFiles = function(filePath, files){
  var savePath = path.join(filePath, 'merge');
  if(!fs.existsSync(savePath)){
    fs.mkdirSync(savePath);
  }
  var names = [];
  var data = [];
  var ext = path.extname(files[0]);
  _.forEach(files, function(file){
    var desc = '/*' + file + '*/';
    file = path.join(filePath, file);
    var buf = fs.readFileSync(file, 'utf8');
    names.push(path.basename(file, ext));
    data.push(desc + '\n' + buf);
  });
  var name = names.join(',') + ext;
  fs.writeFileSync(path.join(savePath, name), data.join('\n'));
};


gulp.task('static_merge', ['static_css', 'static_js', 'static_stylus'], function(cbf){
  var merge = require('./merge');
  var components = require('./components');
  var buildPath = 'statics/build';
  _.forEach(merge.files, function(files){
    concatFiles(buildPath, files);
  });

  var filterFiles = [];
  if(merge.except){
    filterFiles.push.apply(filterFiles, merge.except);
  }
  if(merge.files){
    filterFiles.push.apply(filterFiles, merge.files);
  }
  filterFiles = _.flatten(filterFiles);
  var getRestFiles = function(files){
    return _.filter(files, function(file){
      return !~_.indexOf(filterFiles, file);
    });
  };
  _.forEach(components, function(component){
    var cssFiles = getRestFiles(component.css);
    if(cssFiles.length > 1){
      concatFiles(buildPath, cssFiles);
    }
    var jsFiles = getRestFiles(component.js);
    if(jsFiles.length > 1){
      concatFiles(buildPath, jsFiles);
    }
  });
  cbf();
});


gulp.task('static_version', ['static_merge'], function(){
  var crc32Infos = {};
  var crc32 = function(file){
    var version = bufferCrc32.unsigned(file.contents);
    crc32Infos['/' + file.relative] = version;
    var ext = path.extname(file.path);
    file.path = file.path.substring(0, file.path.length - ext.length) + '.' + version + ext;
    this.emit('data', file);
  };

  return gulp.src(['statics/build/**/*.js', 'statics/build/**/*.css'])
    .pipe(through(crc32, function(){
      fs.writeFileSync('crc32.json', JSON.stringify(crc32Infos, null, 2));
      this.emit('end');
    }))
    .pipe(gulp.dest('statics/dest'));
});


gulp.task('version', function(cbf){
  fs.writeFileSync('./version', moment().format('YYYY-MM-DD HH:mm:ss'));
  cbf();
});

gulp.task('default', ['clean:dest', 'jshint', 'static_copy_other', 'static_merge', 'static_version', 'clean:build', 'version']);