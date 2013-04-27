#!/bin/bash

# drop the previous trace result
mongo localhost:27017/imcom --eval "db.application_trace.drop()"

CWD=`pwd`/libs

APP_NAMES=`mongo --quiet localhost:27017/imcom $CWD/get_app_names.js`

for application_name in $APP_NAMES
do
    $CWD/eval_script.sh $application_name $CWD/trace_app.js
    echo -ne '.'
done

