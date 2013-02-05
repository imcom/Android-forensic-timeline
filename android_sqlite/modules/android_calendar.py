#!/usr/bin/python

import os
import sys
import sqlite3
from android_extractor import Extractor

data_dirs = ["data", "data", "com.android.providers.calendar", "databases", "calendar.db"]
save_to = "Calendar.json"
query = ["select title, dtstart, dtend, duration, eventTimezone, timezone, last_update_time from view_events",]

class Calendar():
    def __init__(self, path_to_data, path_to_result):
        self.extractor = Extractor(path_to_data, path_to_result, data_dirs, save_to)

    def extract(self):
        self.extractor.extract(query)

if __name__ == "__main__":
    print "Calendar extractor"
