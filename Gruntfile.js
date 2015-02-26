module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-html-index');

	grunt.initConfig({
    	pkg : grunt.file.readJSON("package.json"),

        htmlindex:{
            dist:{
                expand: true,
                src: ['src/**/*.html'],
                dest: './menu.html'
            }
        }
    });

    grunt.registerTask('dev', ['htmlindex']);

};