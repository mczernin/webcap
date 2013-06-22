module.exports = function(grunt) {
    
    grunt.initConfig({
        
        nodemon: {
            dev: {
                options: {
                    watchedFolders: ['src'],
                    debug: true,
                    file: 'src/webcap-service.js',
                    delayTime: 1
                }
            }
        }
        
    });
    
    grunt.loadNpmTasks('grunt-nodemon');
    
    grunt.registerTask('default', ['nodemon']);
}
