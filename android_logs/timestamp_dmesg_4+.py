#!/usr/bin/python

import sys
import re
import os
import json
from datetime import timedelta, datetime

btime = datetime.fromtimestamp(float(sys.argv[1]))
log_file = sys.argv[2]
save_to = sys.argv[3]

time_data_mask = re.compile("^.*\[(?P<etime>\s*\d+\.\d+)\](?P<event>.*$)")

if not os.path.isdir(save_to):
    #TODO write the following info to log file
    #print "creating result directory... " + save_to
    os.makedirs(save_to)

new_log_file = open(save_to + os.path.sep + os.path.basename(log_file), 'w')

with open(log_file) as dmesg:
    lines = dmesg.read().strip()
    for line in lines.split('\n'):
        #FIXME on android 4.0+ log entry starts with '<#>'
        if not line.startswith('[') and not line.startswith('<'):
            continue
        match = time_data_mask.match(line) 
        if match is not None:
            seconds = int(match.groupdict().get('etime').split('.')[0])
            nseconds = int(match.groupdict().get('etime').split('.')[1])
            mseconds = int(round(nseconds / 1000))
            event = match.groupdict().get('event')
            timestamp = btime + timedelta(seconds=seconds, microseconds=mseconds)
            buf = {'date':int(timestamp.strftime('%s')), 'event':event.strip()}
            json.dump(buf, new_log_file)
            new_log_file.write('\n')
        else:
            #TODO error message
            print 'invalid log entry found', line

new_log_file.close()
print 'ok'




