# write me a what will read the file .env and check if the variable is present in any of the tracked files
# if it is not present, it will fail the commit

#!/bin/bash

# Read the .env file

ENV_FILE=".env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "File $ENV_FILE does not exist."
    exit 1
fi

while IFS='=' read -r key value
do
    if [[ -z "$key" ]] || [[ "$key" == \#* ]]; then
        continue
    fi
    
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [[ -z "$value" ]]; then
        echo "Value for key $key is empty."
        exit 1
    fi
    
    
    if [[ "$key" == "PORT" ]]; then
        continue
    fi
    
    cat $(git ls-files) | grep -q "$value"
    
    
done < "$ENV_FILE"

