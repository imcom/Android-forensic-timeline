#!/bin/bash

DATABASE="imcom"
SERVER="app.js"

if [ ! -f db.lockfile ]
then
    # init application activity collection
    echo -ne 'initialising application activities summary ...\t'
    mongo --quiet localhost:27017/$DATABASE ./libs/app_activity.js
    echo 'ok!'

    # init application trace collection
    echo -ne 'initialising application traces '
    ./libs/init_app_trace.sh $DATABASE
    echo ' ok!'

    touch db.lockfile
fi

./start.sh $SERVER $DATABASE


