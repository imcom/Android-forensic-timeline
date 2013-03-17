#!/usr/bin/python

a = {" asdf": "qweqwe  "}


for key in a:
    a[key.strip()] = a.pop(key).strip()

print a
