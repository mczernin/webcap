# Developer documentation

To start digging around the source code:

1. Clone Webcap repository.
2. `$ npm install` – installs dependencies
3. `$ sudo npm install -g grunt-cli` – installs [Grunt][grunt] so it's available as a command line tool.

### Webcap REST API, `webcap-service.js`
For changes in the source code to take effect, the service has to be restarted.
This becomes tedious to do by hand, and that's why [Nodemon][nodemon] is used (runs a command and restarts it when files change). Grunt (task automation) is used to run Nodemon, to streamline development.

Run `grunt` command in the root of the project to start the Webcap REST API. It restarts automatically when the source code changes.

  [grunt]: http://gruntjs.com/
  [nodemon]: https://npmjs.org/package/grunt-nodemon
