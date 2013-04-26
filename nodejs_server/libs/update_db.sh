#!/bin/bash

INPUT_DIR='../uploads/json'
DATABASE='imcom'

cd $INPUT_DIR
INPUT_FILES=`ls`

for file in $INPUT_FILES
do
    collection=`echo $file | awk -F . '{print $1}'`
    mongoimport --db $DATABASE --collection $collection --upsert --upsertFields date,msg,object,pid --file $file
done

