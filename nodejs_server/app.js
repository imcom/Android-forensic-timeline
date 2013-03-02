/*
 *
 * Forensic timeline analysis
 *
 */

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
var routes = require('./routes');

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path).set('compress', true).use(nib());
};

app.configure(function(){
    app.set('port', process.env.PORT || 2222);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(
            {
                src: path.join(__dirname, 'public'),
                compile: compile
            }
        )
    );
    app.use(express.static(path.join(__dirname, 'public')));
    app.locals.globalScripts = ['/js/d3.js', '/js/zepto.min.js', '/js/bootstrap.min.js']
});

app.get('/', routes.imcom);

app.listen(app.get('port'));
