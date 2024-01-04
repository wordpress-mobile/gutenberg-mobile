#!/bin/bash -eu

node -e 'console.log("Heap size limit:",v8.getHeapStatistics().heap_size_limit/(1024*1024))'

total_memory=$(free -m | awk '/^Mem:/{print $2}')
available_memory=$(free -m | awk '/^Mem:/{print $7}')

echo "Total Memory: ${total_memory}MB"
echo "Available Memory: ${available_memory}MB"

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
