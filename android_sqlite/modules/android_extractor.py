#!/usr/bin/python

'''
    generic SQLite3 database file extractor.
    connect to datase file and execute queries.

    Author: Yu Jin (imcom)
'''

import os
import sys
import json
import sqlite3
import codecs

class Extractor:

    def __init__(self, path_to_data, path_to_result, data_dirs, save_to):
        self.database = path_to_data + os.path.sep + os.path.sep.join(data_dirs)
        self.result_file = path_to_result + os.path.sep + save_to

    def extract(self, queries):
        print "connecting to database... " + self.database

        try:
            conn = sqlite3.connect(self.database)
        except:
            print "failed to open database... " + self.database
            sys.exit(-1)
        cursor = conn.cursor()

        fp = codecs.open(self.result_file, "w", encoding = "utf-8")

        for query in queries:
            result = cursor.execute(query)
            #TODO deal with file system exceptions, e.g. permission not sufficient
            print "writting result to file... " + self.result_file

            if (result is not None):
                col_names = map(lambda x: x[0], result.description)
                result_json = dict()
                #print col_names
                for record in result:
                    line = ''
                    for index, name in enumerate(col_names):
                        result_json[name] = record[index]
                    json.dump(result_json, fp)
                    fp.write('\n')

        print "extraction finished, closing..."

        result.close()
        cursor.close()
        conn.close()
        fp.close()

if __name__ == "__main__":
    print "Generic extractor for Sqlite3"

