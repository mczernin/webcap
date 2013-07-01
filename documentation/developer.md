# Developer documentation

To start digging around the source code:

1. Clone Webcap repository.
2. `$ npm install` installs dependencies
3. `$ sudo npm install -g grunt-cli` installs [Grunt][grunt] command line tool so it's available in `PATH`

### Webcap REST API, `webcap-service.js`
For changes in the source code to take effect, the service has to be restarted.
This becomes tedious to do by hand, and that's why [Nodemon][nodemon] (runs a command and restarts it when files change) is used. To streamline development, Grunt (task automation) is used to run Nodemon.

`grunt` this command is all you need to run in the root of the project to start the Webcap REST API, which is restarted automatically when the source code changes.
