#!/usr/bin/python

'''
    python script for parsing packages.list file from Android system
    The file contains all installed applications with their uid, pid and path

    Author: Yu Jin (imcom)
'''

import sys
import os
import json

read_from = sys.argv[1]
save_to = sys.argv[2]

list_file = 'packages.list'

packages_list = open(read_from + os.path.sep + list_file)
packages_json = open(save_to + os.path.sep + list_file, 'w')
packages = map(lambda x: x.split(' '), packages_list.read().strip().split('\n'))
for package in packages:
    json_buf = {
            'name': package[0],
            'uid': package[1],
            'gid': package[2],
            'path': package[3]
    }
    json.dump(json_buf, packages_json) # dump dict as json to file
    packages_json.write('\n')

packages_list.close()
packages_json.close()


