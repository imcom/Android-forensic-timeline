#!/bin/bash

export DATABASE=$1

# drop the previous trace result
mongo localhost:27017/$DATABASE --eval "db.application_trace.drop()" 1>/dev/null 2>&1

CWD=`pwd`/libs

APP_NAMES=`mongo --quiet localhost:27017/$DATABASE $CWD/get_app_names.js`

for application_name in $APP_NAMES
do
    $CWD/eval_script.sh $application_name $CWD/trace_app.js
    echo -ne '.'
done

