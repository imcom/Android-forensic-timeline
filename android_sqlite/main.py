#!/usr/bin/python

import os
import sys
import modules.android_downloads as downloads
import modules.android_calendar as calendar
import modules.android_facebook as facebook
import modules.facebook_threads as fb_threads
import modules.facebook_analytics as fb_analytics

if len(sys.argv) < 3:
    print "Usage: python " + sys.argv[0] + " path_to_data_dir path_to_result_dir"
    sys.exit(-1)
    
path_to_data = sys.argv[1]
path_to_result = sys.argv[2]

if not os.path.isdir(path_to_result):
    print "creating result set directory... " + path_to_result
    os.makedirs(path_to_result)

download_extractor = downloads.Downloads(path_to_data, path_to_result)
download_extractor.extract()

calendar_extractor = calendar.Calendar(path_to_data, path_to_result)
calendar_extractor.extract()

fb_extractor = facebook.Facebook(path_to_data, path_to_result)
fb_threads_extractor = fb_threads.FacebookThreads(path_to_data, path_to_result)
fb_analytics_extractor = fb_analytics.FacebookAnalytics(path_to_data, path_to_result)
fb_extractor.extract()
fb_threads_extractor.extract()
fb_analytics_extractor.extract()
