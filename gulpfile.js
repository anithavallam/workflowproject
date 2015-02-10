var gulp = require('gulp'),
  
  gutil = require('gulp-util'),
  
  coffee = require('gulp-coffee'),

  concat = require('gulp-concat'),
  browserify = require('gulp-browserify'),
  connect = require('gulp-connect'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyHTML = require('gulp-minify-html'),
  jsonminify = require('gulp-jsonminify'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  compass  =  require('gulp-compass');


  

  var env,
  coffeeSources,
  htmlSourcess,
  jsSources,
  sassSources,
  jsonSourcess,
  outputDir,
  sassStyle;

  env = process.env.NODE_ENV || 'development';


  if( env === 'development') {

    outputDir = 'builds/development/';
    sassStyle = 'expanded';

  } else {
       
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
  }

 coffeeSources = ['components/coffee/tagline.coffee'];
 jsSources    = [
'components/scripts/rclick.js',
'components/scripts/pixgrid.js',
'components/scripts/tagline.js',
'components/scripts/template.js',
];

 sassSources = ['components/sass/style.scss'];
 htmlSources = ['builds/development/*.html'];
 jsonSources = [outputDir+'js/*.json'];

gulp.task('coffee', function() {
  gulp.src(coffeeSources)
  
  .pipe(coffee({ bare: true })
       .on('error', gutil.log))
  
  .pipe(gulp.dest('components/scripts'))
});

gulp.task('js', function() {
gulp.src(jsSources)
.pipe(concat('script.js'))
.pipe(browserify())
.pipe(gulpif(env === 'production', uglify()))
.pipe(gulp.dest(outputDir+'js'))
.pipe(connect.reload())
});

gulp.task('compass', function() {
gulp.src(sassSources)
.pipe(compass({
	sass: 'components/sass',
	image: outputDir+'images',
	style:  sassStyle

})
.on('error',gutil.log))
.pipe(gulp.dest(outputDir+'css'))
.pipe(connect.reload())
});

gulp.task('html', function() {
  gulp.src('builds/development/*.html')
  .pipe(gulpif(env=== 'production',minifyHTML()))
  .pipe(gulpif(env=== 'production',gulp.dest(outputDir)))
  .pipe(connect.reload()) 
});


gulp.task('images', function() {
  gulp.src('builds/development/images/**/*.*')
  .pipe(gulpif(env=== 'production',imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
  .pipe(gulpif(env=== 'production',gulp.dest(outputDir+'images')))
  .pipe(connect.reload()) 
});


gulp.task('json', function() {
  gulp.src('builds/development/js/*.json')
  .pipe(gulpif(env=== 'production',jsonminify()))
  .pipe(gulpif(env=== 'production',gulp.dest('builds/production/js')))
  .pipe(connect.reload())
 });

gulp.task('watch', function() {
gulp.watch(coffeeSources, ['coffee']);
gulp.watch(jsSources, ['js']);
gulp.watch('components/sass/*.scss', ['compass']);
gulp.watch('builds/development/*.html', ['html']);
gulp.watch('builds/development/**/*.*', ['images']);

});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});


gulp.task('default',['html','json','coffee','js','compass','images','connect','watch']);
