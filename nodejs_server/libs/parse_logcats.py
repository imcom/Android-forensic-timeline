#!/usr/bin/python

import re
from datetime import datetime
import time
import sys
import json
import os

read_from = sys.argv[1]
save_to = sys.argv[2]

cur_year = datetime.utcnow().year
log_files = ['main.log', 'system.log', 'events.log', 'radio.log']
time_data_mask = re.compile("^(?P<etime>\d+-\d+\s[\d+:]+\d+)(.\d+)\s(?P<event>.*)$")
pid_msg_mask = re.compile("^(?P<level>[A-Z])/(?P<object>[a-zA-Z0-9._\s]+[a-zA-Z0-9]+)[\s:]*[(](?P<pid>\s*[0-9]+)[)]:\s(?P<msg>.*)$")

for log_file in log_files:
    print 'parsing log file [' + log_file + '] ...',
    new_log_file = open(save_to + os.path.sep + log_file, 'w')
    with open(read_from + os.path.sep + log_file) as src:
        lines = src.read().strip()
        for line in lines.split('\n'):
            match = time_data_mask.match(line)
            if match is not None:
                etime = str(cur_year) + '-' + match.groupdict()["etime"]
                event = match.groupdict()["event"]
                timestamp = time.mktime(datetime.strptime(etime, "%Y-%m-%d %H:%M:%S").timetuple())
                #buf = {'date':int(timestamp), 'event':event.strip()}
                try:
                    details = pid_msg_mask.match(event).groupdict()
                except:
                    #TODO move this output to error log
                    #print "failed to parse input message"
                    #print event
                    pass
                buf = {
                    'date':int(timestamp),
                    'level':details['level'],
                    'object':details['object'].strip().replace('.', '_'), # replace `.` due to Mongo does not like it
                    'pid':details['pid'].strip(),
                    'msg':details['msg'].strip(),
                }
                json.dump(buf, new_log_file)
                new_log_file.write('\n')
            else:
                #TODO move this output to log file 
                #print 'invalid log entry found', line
                pass

        new_log_file.close()
        print 'ok'




