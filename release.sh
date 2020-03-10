#!/bin/bash
set -e
# npm install --global np
np $*

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

echo $PACKAGE_VERSION  > ../sitespeed.io/docs/_includes/version/coach-core.txt
