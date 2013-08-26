## Developer documentation

To start digging around the source code:

1. Clone Webcap repository.
2. `$ npm install` – installs dependencies
3. `$ npm update` – installs devDependencies
4. `$ sudo npm install -g grunt-cli` – installs [Grunt] globally.

### HTTP API, `webcap-service.js`
For changes in the source code to take effect, the service has to be restarted.
This becomes tedious to do by hand, and that's why [Nodemon] is used (runs a command and restarts it when files change). [Grunt] (task automation) is used to run Nodemon, for future expandability.

Run `grunt` command under the project's directory to start the HTTP API. Now the `webcap-service.js` restarts automatically when the source code changes.

  [grunt]: http://gruntjs.com/
  [nodemon]: https://npmjs.org/package/grunt-nodemon
