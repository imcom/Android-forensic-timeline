#!/bin/bash

SERVER_PATH=`pwd`

mongo --quiet localhost:27017/imcom --eval "var application_name = '$1'" $SERVER_PATH/public/js/vendor/underscore-min.js $SERVER_PATH/public/js/tokenizer.js $2 1>/dev/null

