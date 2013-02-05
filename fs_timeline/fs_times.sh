#!/bin/bash

## stick out all files of the specified inode number[$2] from bodyfile[$1]
cat $1 | awk -F '|' '{if($3 == '$2') print $0}'
