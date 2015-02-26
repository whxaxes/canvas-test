module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-include-html');
    grunt.loadNpmTasks('grunt-html-index');

	grunt.initConfig({
    	pkg : grunt.file.readJSON("package.json"),

		// 使用grunt-includes构建html页面
        includereplace: {
            options:{
                globals:{
                    var1:"var1",
                    var2:"var2"
                }
            },

            html: {
                cwd: 'test/html-init/',
                expand: true,
                src: ['**/*'],
                dest: 'test/html/'
            }
        },

        htmlindex:{
            dist:{
                cwd: 'test/',
                expand: true,
                src: ['html/**/*'],
                dest: './menu.html'
            }
        }
    });

	grunt.registerTask('run', ['includereplace:html']);
    grunt.registerTask('go', ['htmlindex']);

};