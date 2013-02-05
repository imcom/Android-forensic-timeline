#!/bin/bash

MASK="pjson"

targets=`ls -l | grep $MASK | awk '{print $NF}'`

for file in $targets
do
    output=`echo $file | awk -F . '{print $1}'`".json"
    echo -ne "converting... "$file"\t"
    ./json_formatter.py $file $output
    echo "ok"
done

echo "done!"
