#!/usr/bin/python

from os import path
import sys
import glob
import subprocess
import shutil
import time

def syncFile(src, dst):
    try:
        f4sync = glob.glob(src + "*.sh")
        f4sync.extend(glob.glob(src + "*.py"))
        for f in f4sync:
            shutil.copy(f, dst)
        return len(f4sync)
    except e:
#TODO print error info
        return -1

programs = ["android_logs",
            "android_sqlite",
            "fs_timeline",
            "jsonizer"
           ]

git_dir = path.abspath(path.curdir) + path.sep
home_dir = path.expanduser('~') + path.sep

bak_dir = home_dir + "Desktop/Forensics/source_code"
dev_dir = home_dir + "Documents/code/lab/forensics/android"
eclipse_workspace = home_dir + "Documents/code/workspace/Forensics"

if not path.isdir(git_dir):
    print "Git directory is not found. Terminating..."
    sys.exit(-1)

do_backup = path.isdir(bak_dir)
if not do_backup:
    print "Skipping backup process since backup directory is not found... "
else:
    print "Backup directory is set to [%s]" % (bak_dir)

print "Start syncing source code to Git repository... [%s]" % (git_dir)

for program in programs:
    src = dev_dir + path.sep + program + path.sep
    dst = git_dir + program + path.sep
    print "syncing %s ...\t" % program,
    rtn = syncFile(src, dst)
    if program is 'android_sqlite':
        rtn *= syncFile(src + "modules/", dst + "modules/")
    if rtn > 0:
        print "ok"
    else:
        print "Failed to sync %s" % program

print "Start syncing [%s] project... " % eclipse_workspace,
src = eclipse_workspace + path.sep
rtn = subprocess.call(["cp", "-r", src + "AndroidManifest.xml", src + "res", src + "src", git_dir + "java/"])
if rtn is not 0:
    print "Failed to sync [%s] project" % eclipse_workspace
else:
    print "ok"

print 'Start backing up Git repo...'
archive = shutil.make_archive(bak_dir + "/bak_" + time.strftime("%Y%m%d%H%M"), "gztar", git_dir)
if archive is not None:
    print 'Git repo has backed up to [%s]' % archive
    print 'Sync has completed'
else:
    print 'Failed to back up Git repo.\nQuitting...'



