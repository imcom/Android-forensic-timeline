#!/bin/bash

if [ $# -lt 2 ]
then
    echo "Usage: "$0" <server app> <database>"
    exit -1
fi

echo 'starting server now ...'
node $1 $2






