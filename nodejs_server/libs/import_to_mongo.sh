#!/bin/bash

INPUT_DIR='../uploads/json'
DATABASE='test'

cd $INPUT_DIR
input_files=`ls`

for file in $input_files
do
    collection=`echo $file | awk -F . '{print $1}'`
    mongoimport --db $DATABASE --collection $collection --upsert --upsertFields date,msg,object,pid --file $file
done

