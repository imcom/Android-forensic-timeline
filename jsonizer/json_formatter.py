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
        json_data = dict(map(lambda x: x.split(":", 1), line.split(" ")))
        json.dump(json_data, ofile)
        ofile.write("\n")

ifile.close()
ofile.close()
