#!/usr/bin/python

import os
import sys
import sqlite3
from android_extractor import Extractor

data_dirs = ["data", "data", "com.android.providers.downloads", "databases", "downloads.db"]
save_to = "Downloads.json"
query = ["select hint, title, _data, notificationpackage, mimetype, uri, referer, description, lastmod from downloads",]

class Downloads():
    def __init__(self, path_to_data, path_to_result):
        self.extractor = Extractor(path_to_data, path_to_result, data_dirs, save_to)

    def extract(self):
        self.extractor.extract(query)

if __name__ == "__main__":
    print "Downloads extractor"
