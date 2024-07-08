package cmp

import (
	"bytes"
	"compress/gzip"
	"io/ioutil"
)

func GzipDecompress(data []byte) ([]byte, error) {
	buf := bytes.NewBuffer(data)
	gz, err := gzip.NewReader(buf)
	if err != nil {
		return nil, err
	}
	defer gz.Close()

	return ioutil.ReadAll(gz)
}
