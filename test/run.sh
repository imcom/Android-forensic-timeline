#!/bin/bash

if [ $# -lt 2 ]
then
    echo 'usage:'$0' <keyword> <mongo-script>'
    exit -1
fi

mongo --quiet localhost:27017/imcom --eval "var application_name = '$1', keyword = '$1', time_offset = 5" underscore-min.js tokenizer.js $2 | grep -v 'loading file:'


