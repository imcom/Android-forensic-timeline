#!/bin/bash

#TODO set a lock file, when the file exists skip the generation
# init application activity collection
mongo --quiet localhost:27017/imcom ./libs/app_activity.js

# init application trace collection
./libs/init_app_trace.sh

# params: <server app> <db name>
node app.js imcom


