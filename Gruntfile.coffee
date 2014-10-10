path = require 'path'
fs = require 'fs'
_ = require 'underscore'
crc32 = require 'buffer-crc32'
destPath = 'dest'
srcPath = 'src'
staticsSrcPath = path.join srcPath, 'statics'
staticsDestPath = path.join destPath, 'statics'
buildPath = 'build'

normalizePath = 'dest/statics/components/normalize.css'




module.exports = (grunt) ->
  noneCopyFileExts = ['.coffee', '.js', '.styl']
  grunt.initConfig {
    clean : 
      grunt : [
        'node_modules/grunt-contrib-stylus/node_modules/stylus'
        'src/statics/components/jtlazy_load/src'
        'src/statics/components/jquery/src'
      ]
      dest : [destPath]
      build : [buildPath]
    coffee : 
      # node.js的coffee直接编译到目标目录
      node : 
        expand : true
        cwd : srcPath
        src : ['**/*.coffee', '!statics/**/*.coffee']
        dest : destPath
        ext : '.js'
      # 前端用的coffee编译到build目录，后续需要做uglify
      statics :
        expand : true
        cwd : staticsSrcPath
        src : ['**/*.coffee']
        dest : buildPath
        ext : '.js'
    jshint :
      options : 
        eqnull : true
      node :
        expand : true
        cwd : destPath
        src : ['**/*.js']
      statics :
        expand : true
        cwd : buildPath
        src : ['**/*.js']
    uglify : 
      statics :
        files : [
          {
            expand : true
            cwd : buildPath
            src : '**/*.js'
            dest : staticsDestPath
            filter : (file) ->
              stat = fs.lstatSync file
              !stat.isDirectory()
          }
          {
            expand : true
            cwd : staticsSrcPath
            src : '**/*.js'
            dest : staticsDestPath
            filter : (file) ->
              stat = fs.lstatSync file
              !stat.isDirectory()
          }
        ]
    stylus :
      bulid :
        files : [
          {
            expand : true
            cwd : srcPath
            src : ['**/*.styl']
            dest : destPath
            ext : '.css'
          }
        ]
    copy :
      # 将其它不需要处理的文件复制（除coffee js styl）
      build : 
        files : [
          {
            expand : true
            cwd : srcPath
            src : ['**/*']
            dest : destPath
            filter : (file) ->
              ext = path.extname file
              if ext && ~noneCopyFileExts.indexOf ext
                false
              else
                true
          }
        ]
      # 将前端使用的js未压缩版的文件复制一份到src目录下，为了线上调试用
      js :
        files : [
          {
            expand : true
            cwd : buildPath
            src : ['**/*.js']
            dest : staticsDestPath + '/src'
          }
          {
            expand : true
            cwd : staticsSrcPath
            src : '**/*.js'
            dest : staticsDestPath + '/src'
          }
        ]
    cssmin : 
      build : 
        files : [
          {
            expand : true
            cwd : destPath
            src : ['**/*.css']
            dest : destPath
            filter : (file) ->
              stat = fs.lstatSync file
              !stat.isDirectory()
          }
        ]
    imageEmbed : 
      build : 
        files : [
          {
            expand : true
            cwd : destPath
            src : ['**/*.css']
            dest : destPath
            filter : (file) ->
              stat = fs.lstatSync file
              !stat.isDirectory()
          }
        ]
    # 计算静态文件的crc32
    crc32 : 
      strict :
        files : [
          {
            expand : true
            cwd : staticsDestPath
            src : ['**/*.css', '**/*.js']
          }
        ]
  }

  grunt.registerTask 'seaConfig', ->
    crc32Buf = fs.readFileSync path.join destPath, 'crc32.json'
    crc32Infos = JSON.parse crc32Buf
    configFile = path.join staticsDestPath, 'javascripts/sea_config.js'
    str = fs.readFileSync configFile, 'utf8'
    _.each crc32Infos, (crc32, name) ->
      name = name.substring 1
      str = str.replace name, "#{name}?v=#{crc32}" 
    fs.writeFileSync configFile, str

    # 合并静态文件文件
  grunt.registerTask 'merge_static', ->
    Merger = require 'jtmerger'
    grunt.file.mkdir path.join staticsDestPath, 'merge'
    components = require path.join __dirname, 'src/components.json'
    mergeInfo = require path.join __dirname, 'src/merge.json'
    merger = new Merger mergeInfo
    result = merger.getMergeList components, staticsDestPath
    _.each result, (files, saveFile) ->
      merger.merge __dirname, saveFile, files

  grunt.registerMultiTask 'crc32', ->
    crc32Infos = {}
    @files.forEach (file) ->
      src = file.src[0]
      stat = fs.lstatSync src
      if !stat.isDirectory()
        buf = fs.readFileSync src
        destFile = '/' + file.dest
        crc32Infos[destFile] = crc32.unsigned buf
    fs.writeFileSync path.join(destPath, 'crc32.json'), JSON.stringify( crc32Infos, null, 2)

  grunt.registerTask 'version', ->
    file = path.join destPath, 'version'
    date = new Date()
    month = date.getMonth() + 1
    if month < 10
      month = "0#{month}"
    day = date.getDate()
    if day < 10
      day = "0#{day}"
    hours = date.getHours()
    if hours < 10
      hours = "0#{hours}"
    minutes = date.getMinutes()
    if minutes < 10
      minutes = "0#{minutes}"
    fs.writeFileSync file, "#{date.getFullYear()}-#{month}-#{day} #{hours}:#{minutes}"


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-image-embed'
  grunt.loadNpmTasks 'grunt-contrib-cssmin'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-concat'

  grunt.registerTask 'gen', ['clean:grunt', 'clean:dest', 'coffee', 'jshint', 'uglify', 'copy:build', 'stylus', 'cssmin', 'crc32', 'merge_static', 'imageEmbed', 'crc32', 'copy:js', 'clean:build']
  grunt.registerTask 'default', ['gen', 'version']