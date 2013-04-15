#!/bin/bash

#TODO set a lock file, when the file exists skip the generation
#mongo --quiet localhost:27017/imcom ./libs/app_activity.js

node app.js imcom


