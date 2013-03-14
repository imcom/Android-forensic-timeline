#!/usr/bin/python

import sys
import json
from datetime import datetime
import time
import re

inode_file = open(sys.argv[1])
output_file = open(sys.argv[2], 'w')

date_mask = re.compile("^(?P<date>\d+-\d+-\d+ \d+:\d+:\d+)\s?.*$")

content = inode_file.read()

records = list(line.split(',') for line in content.strip().split('\n'))

for record in records:
    json_dict = dict(map(lambda x:x.split(':', 1), record))
    for key in json_dict:
        value = json_dict[key].strip()
        date = date_mask.match(value) # get rid of tailing timezone e.g. (CEST)
        if date:
            value = int(time.mktime(datetime.strptime(date.groupdict()['date'], "%Y-%m-%d %H:%M:%S").timetuple()))
        json_dict[key] = value
    json.dump(json_dict, output_file)
    output_file.write("\n")

inode_file.close()
output_file.close()
