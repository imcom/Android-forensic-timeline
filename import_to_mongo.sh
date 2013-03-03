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
input_files=`ls`

for file in $input_files
do
    collection=`echo $file | awk -F . '{print $1}'`
    mongoimport --db $DATABASE --collection $collection --file $file
done

cd $CUR_DIR
