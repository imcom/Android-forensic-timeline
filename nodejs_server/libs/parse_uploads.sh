#!/bin/bash

# parse logcat logs to json
python ./libs/parse_logcats.py $1 $2

# parse packages list file to json
python ./libs/packages_list.py $1 $2


