#!/usr/bin/python

import os
import sys
import sqlite3
from android_extractor import Extractor

data_dirs = ["data", "data", "com.facebook.katana", "databases", "analytics_db2"]
save_to = "FacebookAnalytics.json"
query = ["select data, timestamp from events",
         "select name, time from view_counter",
        ]

class FacebookAnalytics():
    def __init__(self, path_to_data, path_to_result):
        self.extractor = Extractor(path_to_data, path_to_result, data_dirs, save_to)

    def extract(self):
        self.extractor.extract(query)

if __name__ == "__main__":
    print "Facebook extractor"
