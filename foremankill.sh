#!/bin/bash
for f in tmp/pids/*.pid; do kill `cat "$f"`; done
