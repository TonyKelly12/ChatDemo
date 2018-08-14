#!/bin/bash
#
# This file is used to deploy to an android phone. It both signs the app and

ionic cordova run android --device --buildConfig=build.json
