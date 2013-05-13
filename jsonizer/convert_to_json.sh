#!/bin/bash

MASK="pjson"

if [ $# -lt 2 ]
then
    echo 'Usage: '$0' <input_path> <output_path>'
    exit -1
fi

IN_PATH=$1
OUT_PATH=$2

if [ ! -d $OUT_PATH ]
then
    mkdir -p $OUT_PATH
fi

targets=`ls -l $IN_PATH | grep $MASK | awk '{print $NF}'`

for file in $targets
do
    output=`echo $file | awk -F . '{print $1}'`".json"
    echo -ne "converting... "$IN_PATH"/"$file"\t"
    ./json_formatter.py $IN_PATH"/"$file $OUT_PATH"/"$output
    echo "ok"
done

echo "done!"
