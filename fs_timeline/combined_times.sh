#!/bin/bash

if [ $# -lt 4 ]
then
    echo 'Usage: '$0' body_file disk_image output_dir start_time(yyyy-mm-dd)'
    exit -1
fi

BODY_FILE=$1
DD_IMAGE=$2
OUTPUT=$3
START_TIME=$4

INODE_TIMELINE=$OUTPUT"/inode.timeline"
FS_TIMELINE=$OUTPUT"/fs.timeline"

# wait until the device is connected
echo -ne 'waiting for device connecting...\t'
adb wait-for-device
echo 'ok'

if [ ! -d $OUTPUT ]
then
    echo "Creating directory... "$PWD"/"$OUTPUT
    mkdir -p $PWD"/"$OUTPUT
else
    echo $OUTPUT" exists!"
fi

# get timezone from the device
TIME_ZONE=`adb shell date +%Z`
echo 'Device Timezone: '$TIME_ZONE

echo -ne 'Start processing inode times...\t'
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
        inode_time=`echo $istat | sed 's/ (UTC)//g' | awk '{printf "%s,", $0}' | sed 's/Direct.*$//' | sed 's/Group.*uid/uid/' | sed 's/num.*Accessed/Accessed/'`
        echo $inode_time | grep 'Not' 1>/dev/null 2>&1
        if [ ! $? -eq 0 ]
        then
            echo $inode_time | sed 's/Allocated/Allocated: 1/' >> $INODE_TIMELINE
        else
            echo $inode_time | sed 's/Not Allocated/Allocated: 0/' >> $INODE_TIMELINE
        fi
    fi
done

echo 'done!'

