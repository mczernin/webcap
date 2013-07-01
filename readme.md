## WebCap - Web page screenshotting tool

This repository contains two pieces of software and one "role":

* `webcap.js`: Screenshot a web page from the command line (runs on [PhantomJS](http://phantomjs.org/)).
* `webcap-service.js`: REST API for the command line tool (runs on [NodeJS](http://nodejs.org/)).
* TODO: Ability to execute the whole shebang on a free [Heroku](https://www.heroku.com/) dyno.


## URL becomes: image+data

![](https://bitbucket.org/gima/webcap/raw/master/gfx/urlcap.png) ![](https://bitbucket.org/gima/webcap/raw/master/gfx/data.png)


## webcap.js

> [Documentation and examples here][docs]

>     $ phantomjs webcap.js json
> `json` contains program arguments: url, viewport size and cookies among others.


## webcap-service.js

> [Documentation and examples here][docs]

>     $ nodejs webcap-service.js
> Reads settings from the environment: port to listen and key for the API among others.


## Heroku

TODO


## License

[Public Domain][license]. Though a mention of origin would be nice.

  [docs]: https://bitbucket.org/gima/webcap/src/master/documentation
  [license]: http://unlicense.org/
