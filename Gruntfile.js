module.exports = function(grunt) {
    
    grunt.initConfig({
        
        nodemon: {
            dev: {
                options: {
                    cwd: 'src',
                    file: 'webcap-service.js',
                    delayTime: 1
                }
            }
        }
        
    });
    
    grunt.loadNpmTasks('grunt-nodemon');
    
    grunt.registerTask('default', ['nodemon']);
}
