#!/bin/bash

#export NODE_PATH=../nodejs_server/node_modules

#node dig_mongo.js imcom $1
if [ $# -lt 1 ]
then
    echo 'usage:'$0' <mapreduce-script>'
    exit -1
fi

mongo localhost:27017/imcom $@
