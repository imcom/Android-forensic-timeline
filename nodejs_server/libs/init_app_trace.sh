#!/bin/bash

APP_NAMES=`mongo --quiet localhost:27017/imcom get_app_names.js`;

for application_name in $APP_NAMES
do
    ./eval_script.sh $application_name trace_app.js;
done
