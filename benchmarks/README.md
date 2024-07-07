# Cache Server Benchmarking

## Overview

This project benchmarks the performance of a cache server implementation in a microservices architecture. The primary goal is to demonstrate the efficiency gains achieved by incorporating a cache layer in front of an API server. The benchmarking was conducted using Python, and the tests were run sequentially with varying numbers of requests.

## Environment

The benchmarking environment consists of the following components, orchestrated using Docker Compose:

- **Cache Server**: Go-based server with 1 CPU and 512 MB of memory
- **API Server**: Express.js server with 1 CPU and 512 MB of memory, scaled to 3 instances for load balancing
- **CPU**: AMD Ryzen 5 5700G
- **Memory**: 16 GB DDR4

Each request transfers data consisting of 50 events, with each event represented as a JSON object of approximately 815 bytes, resulting in a total data size of 18.47 KB per request.

## Benchmark Results

### Test 1: 1000 Requests Sequentially
- **With Cache**: 1.787 seconds
- **Without Cache**: 5.105 seconds
- **Cache Turnaround**: 1.787 seconds
- **Without Cache Turnaround**: 5.105 seconds
- **Difference**: 3.319 seconds
- **Improvement**: 65.00%

### Test 3: 4000 Requests Sequentially
- **With Cache**: 7.240 seconds
- **Without Cache**: 20.562 seconds
- **Cache Turnaround**: 7.240 seconds
- **Without Cache Turnaround**: 20.562 seconds
- **Difference**: 13.322 seconds
- **Improvement**: 64.79%

### Test 4: 6000 Requests Sequentially
- **With Cache**: 23.226 seconds
- **Without Cache**: 31.141 seconds
- **Cache Turnaround**: 23.226 seconds
- **Without Cache Turnaround**: 31.141 seconds
- **Difference**: 7.915 seconds
- **Improvement**: 25.42%

### Test 5: 8000 Requests Sequentially
- **With Cache**: 23.867 seconds
- **Without Cache**: 39.761 seconds
- **Cache Turnaround**: 23.867 seconds
- **Without Cache Turnaround**: 39.761 seconds
- **Difference**: 15.895 seconds
- **Improvement**: 39.98%

### Test 6: 10000 Requests Sequentially
- **With Cache**: 30.147 seconds
- **Without Cache**: 52.564 seconds
- **Cache Turnaround**: 30.147 seconds
- **Without Cache Turnaround**: 52.564 seconds
- **Difference**: 22.418 seconds
- **Improvement**: 42.65%

## Summary

The benchmarking results demonstrate a significant performance improvement when using a cache server. The percentage improvement ranges from approximately 25% to 65%, depending on the number of requests. This highlights the effectiveness of the cache layer in reducing response times and improving the overall efficiency of the microservices architecture.

## Conclusion

Incorporating a cache server significantly improves the performance of the microservices architecture, as evidenced by the benchmarking results. This setup can be utilized as a reference for optimizing other similar systems.