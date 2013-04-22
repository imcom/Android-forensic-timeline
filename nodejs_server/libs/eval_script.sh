#!/bin/bash

mongo --quiet localhost:27017/imcom --eval "var application_name = '$1'" ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js $2


