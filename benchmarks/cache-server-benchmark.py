import requests
import time

def main():
    API_URL = 'http://localhost/api/event/'
    counts = [1000, 5000, 10000]
    payload = {}
    cache_headers = {'X-Cache': '25'}
    
    def test(url, payload, headers):
        response = requests.get(url, params=payload, headers=headers)
    
    for count in counts:
        start = time.time()
        for _ in range(count):
            test(API_URL, payload, cache_headers)
        print('With Cache:', time.time() - start)
        cache_turnaround = time.time() - start
        
        start = time.time()
        for _ in range(count):
            test(API_URL, payload, {})
        print('Without Cache:', time.time() - start)
        without_cache_turnaround = time.time() - start
        
        print('Cache turnaround:', cache_turnaround)
        print('Without cache turnaround:', without_cache_turnaround)
        
        print('Difference:', without_cache_turnaround - cache_turnaround)
        
        print('Percentage:', str((without_cache_turnaround - cache_turnaround) / without_cache_turnaround * 100)+ '%')

if __name__ == '__main__':
    main()