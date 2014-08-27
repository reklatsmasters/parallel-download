# parallel-download

> Parallel downloads files to the buffer.

## install
```bash
npm install parallel-download
```

## usage 
```js
var download = require("parallel-download");

download(["http://example.com/1.txt", "http://example.com/2.txt"], function(err, res){
	console.error(err);
    res.forEach(function(it){
    	console.log(it.content.length, it.url);
    });
})
```

```js
var Download = require("parallel-download");

var d = new Download({timeout:30*1000});
d.get("http://example.com/1.txt");
d.get("http://example.com/2.txt");
// OR d.get(["http://example.com/1.txt", "http://example.com/2.txt"]);
d.run(function(err, res){
	// ...
});
```

## API

Methods
===

download(urls, [opts], cb)
-----------------------------
Download array of urls

**Parameters**

**urls**: Url | Array.&lt;Url&gt;

**opts**: object, optional, Options for request

**cb**: RunCallback

new Downloader([opts])
-----------------------------

**Parameters**

**opts**: object,  optional, Options for request


Downloader.get(url, [opts]) 
-----------------------------

**Parameters**

**url**: Url | Array.&lt;Url&gt;, 

**opts**: object, optional, Options for request



Downloader.run(cb) 
-----------------------------

**Parameters**

**cb**: RunCallback



Type Definitions
===

RunCallback(err, result)
-----------------------------

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| err | null : Array.&lt;ErrorHash&gt; | Array of errors |
| result | Array.&lt;ResultHash&gt; | Callback with downloaded data |


ErrorHash
-----------------------------

**Type**: object

**Properties**

| Name | Type | Description |
|------|------|-------------|
| url | Url | link |
| error | Error | Error object |
