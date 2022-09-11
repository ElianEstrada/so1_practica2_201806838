#!/bin/bash

sudo docker rmi go_server
sudo docker build . -t go_server
sudo docker run --name back --rm go_server
