## WebCap - Web page screenshotting tool

This repository contains two constructs and one role:

* `webcap.js`: Takes a screenshot of a web page from the command line (runs on [PhantomJS](http://phantomjs.org/)).
* `webcap-service.js`: REST API for the command line tool (runs on [NodeJS](http://nodejs.org/)).
* TODO: Ability to execute the whole shebang on a free [Heroku](https://www.heroku.com/) dyno.

**Url**  

![](https://bitbucket.org/gima/webcap/src/master/gfx/url.png)

**Become: Image + Data**

![](https://bitbucket.org/gima/webcap/src/master/gfx/urlcap.png) ![](https://bitbucket.org/gima/webcap/src/master/gfx/data.png)

## webcap.js

> Up-To-Date [Documentation Here](https://bitbucket.org/gima/webcap/src/master/src/webcap.js).

>     $ phantomjs webcap.js <json>
> **json:** contains program arguments: url, viewport size and cookies among others.

## webcap-service.js

> Up-To-Date [Documentation Here](https://bitbucket.org/gima/webcap/src/master/src/webcap-service.js).

>     $ nodejs webcap-service.js
> Reads settings from environment. `PORT` and `KEY` among others.

## Heroku

TODO
