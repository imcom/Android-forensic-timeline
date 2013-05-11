#!/bin/bash

DATABASE='imcom_som'

# init application traces
mongo --quiet localhost:27017/$DATABASE ./libs/app_activity.js
./libs/init_app_trace.sh $DATABASE

# init input vectors and generate SOM nodes
./libs/init_vectors.sh
python ./libs/cluster/py_cluster.py




