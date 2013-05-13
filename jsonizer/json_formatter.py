#!/usr/bin/python

'''
    python script for parsing content provider query results to json format

    Author: Yu Jin (imcom)
'''

import codecs
import json
import sys
import re

numeric_values = re.compile("date|time|duration")

input_file = sys.argv[1]
output_file = sys.argv[2]

ifile = open(input_file)
ofile = codecs.open(output_file, "w", encoding="utf-8")

lines = ifile.readlines()
if lines is not None:
    for line in lines:
        try:
            # strip off the last newline char
            json_data = dict(map(lambda x: x.split(":", 1), line.strip().split(" ")))
            for key in json_data:
                if numeric_values.search(key):
                    if len(json_data[key]) == 13: # change unit ms to s and convert string to int
                        json_data[key] = int(json_data[key][0:10])
                    else:
                        if key == 'timezone': # timezone setting of the device, its a string
                            continue
                        if json_data[key] == '': # empty record goes to zero
                            json_data[key] = 0
                            continue
                        json_data[key] = int(json_data[key])
        except ValueError as ve:
            #TODO out put to log file
            #print ve.message
            pass
        except TypeError as te:
            #print te.message
            pass
        json.dump(json_data, ofile)
        ofile.write("\n")

ifile.close()
ofile.close()
