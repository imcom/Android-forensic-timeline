#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

import pymongo
import sys
import re
from mahalanobis import mahalanobis_helper
from som_imcom import SOM

# connect to local mongod on default port
client = pymongo.MongoClient("localhost", 27017)

db = client.test #NOTE for developing only

collection = db.events #TODO using events log only at present

OBJECTS_BLACK_LIST = ['free_storage_left', 'battery_status', 'sqlite_mem_released', 'battery_discharge', 'force_gc', 'dvm_gc_madvise_info', 'free_storage_changed', 'dvm_gc_info']
pids = list()
system_objects = list()
vectorized_dataset = list()

raw_dataset = list(record for record in collection.find({'object': {'$nin': OBJECTS_BLACK_LIST}}, {'_id': 0}))

# get two vectors one for pids and the other for sys objects
for record in raw_dataset:
    pid = int(record['pid'])
    pids.append(pid)
    system_objects.append(record['object'])

# sort two vectors above by pid in ASC so the covariance would make sense
pid_vector, object_vector = zip(*sorted(zip(pids, system_objects))) # unpacking arguments by using `*`

for record in raw_dataset:
    pid = int(record['pid'])
    vector = list()
    vector.append(pid_vector.index(pid))
    vector.append(object_vector.index(record['object']))
    vectorized_dataset.append(tuple(vector))

ksom = SOM(10, 10, vectorized_dataset)
for i in range(0, 50):
    #print vectorized_dataset[i]
    ksom.epoch(vectorized_dataset[i])

line_width = 10 
for index, node in enumerate(ksom.nodes):
    print ("(%d,%d):%d " % (node.x, node.y, node.bmu_count)),
    if (index + 1) % line_width is 0:
        print ''


