## WebCap - Web page screenshotting tool

This repository contains two pieces of software and one "role":

* `webcap.js`: Screenshot a web page from the command line (runs on [PhantomJS](http://phantomjs.org/)).
* `webcap-service.js`: REST API for the command line tool (runs on [NodeJS](http://nodejs.org/)).
* Ability to execute the whole shebang on a free [Heroku](https://www.heroku.com/) dyno.


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

You need a Heroku account and the [Heroku Toolbelt](https://toolbelt.heroku.com/) to run the following commands. Basically Heroku runs `node webcap-service.js`, the same way one would do it by hand.

    $ heroku login
    $ heroku create --buildpack https://github.com/ddollar/heroku-buildpack-multi.git
    $ heroku config:set KEY=mysecretkey    // the key necessary to use the REST API (optional)
    $ git push heroku master
    $ heroku config:set PATH=/app/bin:/app/node_modules/.bin:/app/vendor/phantomjs/bin:/usr/local/bin:/usr/bin:/bin

Now you can issue requests to your application's URL as per documentation. The URL can be seen by running `heroku info`.


## License

[Public Domain](http://unlicense.org/). Though a mention of origin would be nice.

  [docs]: https://bitbucket.org/gima/webcap/src/master/documentation
