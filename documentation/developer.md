# Developer documentation

To start digging around the source code:

1. Clone Webcap repository.
2. `$ npm install` installs dependencies
3. `$ sudo npm install -g grunt-cli` installs  [Grunt][grunt] command line tool so it's available in `PATH`

### Webcap REST API, `webcap-service.js`
For changes in the source code to take effect, the service has to be restarted.
This becomes tedious to do by hand, and that's why I chose to use [Nodemon][nodemon] (runs a command and restarts it when files change). To streamline development, I use Grunt (task automation) to run Nodemon.

`grunt` this command is all you need to run in the root of the project to start the Webcap REST API, which is restarted automatically when the source code changes.

### Webcap command line tool, `webcap.js`

Debug (spits everything at your face):  
`$ phantom webcap.js '{"url":"http://fox.com"}'`

Display screenshot using [ImageMagick][imagemagick]  
`$ phantom webcap.js '{"url":"http://fox.com"}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-`

  [grunt]: http://gruntjs.com/
  [nodemon]: https://npmjs.org/package/grunt-nodemon
  [imagemagick]: http://www.imagemagick.org
