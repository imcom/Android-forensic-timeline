#!/bin/bash

## shell script for parsing body file and inode activities

if [ $# -lt 4 ]
then
    echo 'Usage: '$0' body_file disk_image output_dir start_time(yyyy-mm-dd)'
    exit -1
fi

# using [0-9] is more generic
echo $4 | egrep "[0-9]{4}-[0-9]{2}-[0-9]{2}" 1>/dev/null 2>&1
if [ ! $? -eq 0 ]
then
    echo 'Invalid start time, date should be like `yyyy-mm-dd`'
    exit -1
fi

BODY_FILE=$1
DD_IMAGE=$2
OUTPUT=$3
START_TIME=$4

INODE_TIMELINE=$OUTPUT"/inode.tmp"
FS_TIMELINE=$OUTPUT"/fs.tmp"

# wait until the device is connected
echo -ne 'waiting for device connecting...\t'
adb wait-for-device
echo 'ok'

if [ ! -d $OUTPUT ]
then
    echo "creating directory... "$PWD"/"$OUTPUT
    mkdir -p $PWD"/"$OUTPUT
else
    echo $OUTPUT" exists!"
fi

# get timezone from the device
TIME_ZONE=`adb shell date +%Z | awk '{sub("\r$", ""); printf "%s", $0}'`
echo 'device Timezone: '$TIME_ZONE

echo -ne 'start processing inode times...\t'
# remove the description on first line
mactime -b $BODY_FILE -d -y -z $TIME_ZONE $START_TIME | sed '1 d' > $FS_TIMELINE

inodes=`cat $BODY_FILE | grep -v 'Orphan' | awk -F '|' '{print $3}' | sort -n | uniq | awk '{printf "%s ", $0}'`

# create a clean inode timeline file
> $INODE_TIMELINE

for inode in $inodes
do
    # when set timezone, all time is set to UTC
    istat=`istat -z $TIME_ZONE -f ext $DD_IMAGE $inode`
    if [ $? -eq 0 ]
    then
        inode_time=`echo $istat |
            sed 's/ ('$TIME_ZONE')//g' |
            awk '{printf "%s,", $0}' |
            sed 's/Direct.*$//' |
            sed 's/Group.*uid/uid/' |
            sed 's/num.*Accessed/Accessed/'`
        echo $inode_time | grep 'Not' 1>/dev/null 2>&1
        if [ ! $? -eq 0 ]
        then
            line=`echo $inode_time | sed 's/Allocated/Allocated: 1/'`
        else
            line=`echo $inode_time | sed 's/Not Allocated/Allocated: 0/'`
        fi
        echo $line |
            awk '{$6 = ":"$8",";$8 = "";$9 = ""; print $0}' |
            sed 's/Allocated/,allocated/' |
            sed 's/uid/,uid/' |
            sed 's/mode/,mode/' |
            sed 's/size/,size/' |
            sed 's/Accessed/,accessed/' |
            sed 's/File Modified/,file_modified/' |
            sed 's/Inode Modified/,inode_modified/' |
            sed 's/Deleted/,deleted/' |
            grep -v '0000-00-00' >> $INODE_TIMELINE # filter out meaningless records
    fi
done
echo 'ok'

echo -ne 'parsing and formatting timestamps...\t'

python fs_times.py $FS_TIMELINE $OUTPUT"/fs_time.json" 1>&2

python inode_times.py $INODE_TIMELINE $OUTPUT"/inode_time.json" 1>&2

echo 'done!'


