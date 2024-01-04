#!/bin/bash -eu

node -e 'console.log("Heap size limit:",v8.getHeapStatistics().heap_size_limit/(1024*1024))'

total_memory=$(cat /proc/meminfo | awk '/^MemTotal:/{print $2}')
free_memory=$(cat /proc/meminfo | awk '/^MemFree:/{print $2}')

echo "Total Memory: $(expr $total_memory / 1024)MB"  # Convert from KB to MB
echo "Free Memory: $(expr $free_memory / 1024)MB"    # Convert from KB to MB

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
