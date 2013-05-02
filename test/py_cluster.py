#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

import pymongo
import sys
import re
import random
from mahalanobis import mahalanobis_helper
from som_imcom import SOM

# connect to local mongod on default port
client = pymongo.MongoClient("localhost", 27017)

#db = client.test #NOTE for developing only
db = client.imcom #NOTE for developing only

collection = db.events #TODO using events log only at present

OBJECTS_BLACK_LIST = ['free_storage_left', 'battery_status', 'sqlite_mem_released', 'battery_discharge', 'force_gc', 'dvm_gc_madvise_info', 'free_storage_changed', 'dvm_gc_info']
system_objects = dict()
process_ids = dict()
dates = list()

# dataset for generating SOM -- a list of vectors
vectorized_dataset = list()

raw_dataset = list(record for record in collection.find({'object': {'$nin': OBJECTS_BLACK_LIST}}, {'_id': 0}))

# init a dict of system objects for indexing object names and their occurrence times
for record in raw_dataset:
    obj = record['object']
    pid = record['pid']
    date = record['date']
    if system_objects.has_key(obj):
        system_objects[obj] += 1 # counting the occurrence times of a system object
    else:
        system_objects.setdefault(obj, 1) # init the counter
    if process_ids.has_key(pid):
        process_ids[pid] += 1 # counting the occurrence times of a system object
    else:
        process_ids.setdefault(pid, 1) # init the counter
    if not date in dates: # only do indexing for dates
        dates.append(date)

objects = system_objects.keys()
pids = process_ids.keys()
# sorting the two vector by pid, but it does NOT make many sense...
#pid_vector, object_vector = zip(*sorted(zip(pids, system_objects))) # unpacking arguments by using `*`

for record in raw_dataset:
    vector = list()
    pid = record['pid']
    date = record['date']
    obj = record['object']
    vector.append(objects.index(obj))
    vector.append(pids.index(pid))
    vector.append(dates.index(date))
    vectorized_dataset.append(tuple(vector))

ksom = SOM(10, 10, vectorized_dataset, 100)

for iv in random.sample(vectorized_dataset, 100):
    #print iv
    #print objects[iv[0]], pids[iv[1]], dates[iv[2]]
    ksom.epoch(iv)
    pass

line_width = 10 
for index, node in enumerate(ksom.nodes):
    print ("(%d,%d):%d " % (node.x, node.y, node.bmu_count)),
    if (index + 1) % line_width is 0:
        print ''
        pass


