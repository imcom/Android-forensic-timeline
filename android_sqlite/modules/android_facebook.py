#!/usr/bin/python

import os
import sys
import sqlite3
from android_extractor import Extractor

data_dirs = ["data", "data", "com.facebook.katana", "databases", "fb.db"]
save_to = "Facebook.json"
query = ["select title, sender_name, updated from notifications",
         "select target_uid, message, noti_time, receipt_time from push_notifications",
         "select event_name, host, location, start_time, end_time from events",
         "select first_name, last_name, message, timestamp from user_statuses",
        ]

class Facebook():
    def __init__(self, path_to_data, path_to_result):
        self.extractor = Extractor(path_to_data, path_to_result, data_dirs, save_to)

    def extract(self):
        self.extractor.extract(query)

if __name__ == "__main__":
    print "Facebook extractor"
