#!/bin/bash

echo -ne 'extracting boot time from /proc/stat...\t'
BTIME=`cat $1 | grep 'btime' | awk '{print $NF}'`
echo 'ok'

echo 'python timestamp_dmesg.py '$BTIME $2 $3
echo -ne 'formatting timestamps in dmesg...\t'
python timestamp_dmesg.py $BTIME $2 $3
