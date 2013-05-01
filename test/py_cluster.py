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

OBJECTS_BLACK_LIST = ['free_storate_left', 'battery_status', 'sqlite_mem_released', 'battery_discharge', 'force_gc', 'dvm_gc_madvise_info', 'free_storage_changed', 'dvm_gc_info']
pids = dict()
system_objects = dict()
vectorized_dataset = list()

raw_dataset = collection.find({'object': {'$nin': OBJECTS_BLACK_LIST}}, {'_id': 0})

for record in raw_dataset:
    vector = list()
    if not pids.has_key(record['pid']):
        pids.setdefault(record['pid'], 1)
    else:
        pids[record['pid']] += 1
    vector.append(pids.keys().index(record['pid']))

    if not system_objects.has_key(record['object']):
        system_objects.setdefault(record['object'], 1)
    else:
        system_objects[record['object']] += 1
    vector.append(system_objects.keys().index(record['object']))

    vectorized_dataset.append(tuple(vector))

ksom = SOM(30, 10, vectorized_dataset)
for i in range(0, 50):
    ksom.epoch(vectorized_dataset[i])

for node in ksom.nodes:
    print node.weights_vector




