#!/bin/bash

TMP_PATH=$PWD"/timeline.tmp"

if [ $# -lt 2 ]
then
    echo 'Usage: '$0' body_file disk_image'
    exit -1
fi

if [ ! -d $TMP_PATH ]
then
    echo "Creating temporary directory... "$TMP_PATH 1>&2
    mkdir $TMP_PATH
else
    echo $TMP_PATH" exists!" 1>&2
fi

./get_inode_num.sh $1 > $TMP_PATH"/inode_list"

while read number
do
    echo 'Inode number: '$number
    istat $2 $number | grep Time -A3 | tail -3
    #echo ''
    ./fs_times.sh $1 $number > $TMP_PATH"/inode_spec_files"
    LINE_NUM=`cat $TMP_PATH"/inode_spec_files" | wc -l`
    COUNTER=1
    while read line
    do
        echo "File info:"`echo $line | awk -F '|' '{print $2,$4,$5,$6}'`
        #echo ''
        CRTIME=`echo $line | awk -F '|' '{print $NF}'`
        ATIME=`echo $line | awk -F '|' '{print $8}'`
        MTIME=`echo $line | awk -F '|' '{print $9}'`
        CTIME=`echo $line | awk -F '|' '{print $10}'`
        cat $1 | grep -v "$line" | grep -v "Orphan" > $TMP_PATH"/time_related_files"

        echo "created: "$CRTIME
        while read line
        do
            if [ $CRTIME -gt 0 ]
            then
                echo $line | awk -F '|' '{if($NF == '$CRTIME') print "+"$2,$4,$5,$6}'
            fi
        done < $TMP_PATH"/time_related_files"

        echo "accessed: "$ATIME
        while read line
        do
            echo $line | awk -F '|' '{if($8 == '$ATIME'){print "+"$2,$4,$5,$6}}'
        done < $TMP_PATH"/time_related_files"

        echo "modified: "$MTIME
        while read line
        do
            echo $line | awk -F '|' '{if($9 == '$MTIME'){print "+"$2,$4,$5,$6}}'
        done < $TMP_PATH"/time_related_files"

        echo "changed: "$CTIME
        while read line
        do
            echo $line | awk -F '|' '{if($10 == '$CTIME'){print "+"$2,$4,$5,$6}}'
        done < $TMP_PATH"/time_related_files"

        if [ $COUNTER -lt $LINE_NUM ] 
        then
            let COUNTER+=1
            echo "============================================"
        fi
    done < $TMP_PATH"/inode_spec_files"
    echo '-------------------------------------------'
done < $TMP_PATH"/inode_list"




