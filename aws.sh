#!/usr/bin/env bash

# This nascent wrapper script install AWS locally, relative to CWD at ./lib
# and subsequently runs it if it is available. Targeted to OSX/Linux presently.

# Install AWS CLI client locally.
if [ ! -d ./lib/aws ]; then
    mkdir -p ./lib/aws/
	  curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
	  unzip awscli-bundle.zip
	  $PWD/awscli-bundle/install -i $PWD/lib/aws 
	  rm awscli-bundle.zip && rm -rf awscli-bundle
fi

# Run AWS CLI client with passed arguments.
$PWD/lib/aws/bin/aws "$@"
