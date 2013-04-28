#!/bin/bash

if [ ! -f db.lockfile ]
then
    # init application activity collection
    echo -ne 'initialising application activities summary ...\t'
    mongo --quiet localhost:27017/imcom ./libs/app_activity.js
    echo 'ok!'

    # init application trace collection
    echo -ne 'initialising application traces '
    ./libs/init_app_trace.sh
    echo ' ok!'

    touch db.lockfile
fi

echo 'starting server now ...'
# params: <server app> <db name>
node app.js imcom

