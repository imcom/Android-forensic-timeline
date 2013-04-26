#!/bin/bash

if [ $# -lt 2 ]
then
    echo "Usage: "$0" <input_path> <database>"
    exit -1
fi

INPUT_DIR=$1
DATABASE=$2
CUR_DIR=`pwd`

if [ ! -d $INPUT_DIR ]
then
    echo "No such directory: "$INPUT_DIR
    exit -1
fi

cd $INPUT_DIR
INPUT_FILES=`ls`

LOGCATS="main system events radio"

for file in $INPUT_FILES
do
    collection=`echo $file | awk -F . '{print $1}'`
    if [[ $LOGCATS == *$collection* ]]; then # remove the duplicate lines of a same event in logcat logs
        mongoimport --db $DATABASE --collection $collection --file $file --upsert --upsertFields date,msg,object,pid
    else
        mongoimport --db $DATABASE --collection $collection --drop --file $file
    fi
done

cd $CUR_DIR
