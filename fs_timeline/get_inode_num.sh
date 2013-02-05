#!/bin/bash

## fetch all inode numbers from the given bodyfile
cat $1 | grep -v 'Orphan' | awk -F '|' '{print $3}' | sort | uniq
