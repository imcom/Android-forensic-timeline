#!/bin/bash

mongo --quiet localhost:27017/imcom ./libs/app_activity.js

node app.js imcom


