#!/usr/bin/python

import codecs
import json
import sys

input_file = sys.argv[1]
output_file = sys.argv[2]

ifile = open(input_file)
ofile = codecs.open(output_file, "w", encoding="utf-8")

lines = ifile.readlines()
if lines is not None:
    for line in lines:
        try:
            json_data = dict(map(lambda x: x.split(":", 1), line.split(" ")))
        except:
            #TODO out put to log file
            # invalid format occured
            pass
        json.dump(json_data, ofile)
        ofile.write("\n")

ifile.close()
ofile.close()
