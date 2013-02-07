#!/usr/bin/python

#TODO write a script to sync java code in eclipse workspace

from os import path
import sys

git_dir = path.abspath(path.curdir) + path.sep
home_dir = path.expanduser('~') + path.sep

bak_dir = home_dir + path.sep + "Desktop" + path.sep + "Forensics" + path.sep + "source_code" + path.sep
dev_dir
eclipse_workspace

if not path.isdir(git_dir):
    print "Git directory is not found. Terminating..."
    sys.exit(-1)

do_backup = path.isdir(bak_dir)
if not do_backup:
    print "Skipping backup process since backup directory is not found... "
