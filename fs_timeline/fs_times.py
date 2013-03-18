#!/usr/bin/python

import sys
import json
import codecs
import iso8601
import time

col_names = ['date', 'size', 'activity', 'perms', 'uid', 'gid', 'inode', 'file']

mactime_file = open(sys.argv[1])
output_file = codecs.open(sys.argv[2], 'w', encoding = "utf-8")

content = mactime_file.read()

records = list(map(lambda x:x.split(','), content.strip().split('\n')))

for record in records:
    json_dict = dict()
    for index, value in enumerate(record):
        if index == 0:
            date = iso8601.parse_datetime(value)
            timestamp = time.mktime(date.timetuple())
            json_dict[col_names[index]] = int(timestamp)
        elif index == 1: # convert the size from string to int for query selection purpose
            json_dict[col_names[index]] = int(value)
        else:
            json_dict[col_names[index]] = value
    json.dump(json_dict, output_file)
    output_file.write('\n')

mactime_file.close()
output_file.close()
