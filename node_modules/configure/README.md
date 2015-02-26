# _node-configure_

There are several configuration modules available for node.js. Each have their strengths and weaknesses, but
no one project can be considered the optimal configuration option for all use cases. Some applications have
need of complex configuration that can be fetched from a central server. Others just want a simple JSON object
loaded when the app starts.

_node-configure_ seeks to solve the problem of a single application that is being developed by a group of
developers who need the ability to have a different application configuration for each developer and deployment environment,
but do not wish to utilize a complex configuration module.

Using _node-configure_, each developer can have a separate configuration file checked in to source control without
being forced to worry about overwrites from another developer.

#Overview

_node-configure_ is designed to provide a global config that can be obtained from any node application file without
forcing the main app file to load and pass around configuration setting objects. With _node-configure_, any file or
module that requires the _node-configure_ module will receive the same configuration object, which is the parsed
result of the JSON configuration file.

With _node-configure_, it is the responsibility of modules that wish to obtain configuration settings to know
their appropriate configuration fields and to provide defaults as necessary.

## Example
The following is an example of how one might use the _node-configure_ module.

The `myConfig.json` file:

```json
{
    "serverPort" : 3000,
    "couchDb" : {
        "host" : "localhost",
        "port" : 5984,
    }
}
```

The `main.js` file:

```javascript
var config = require("configure");
var port = 2000; // default port
if(config.serverPort) {
    port = config.serverPort;
}
// elsewhere...
server.listen(port, requestHandler);
```

The `database.js` file:

```javascript
var config = require("configure");
var request = { "host":"my.couchdb.com", "port":5984 };
if(config.couchDb) {
    if(config.couchDb.host) {
        request.host = config.couchDb.host;
    }
    if(config.couchDb.port) {
        request.port = config.couchDb.port;
    }
}
// later...
request.path = "/mydata";
http.get(request, responseHandler);
```

The node start script:

    node main.js --config myConfig.json

#The Config File

At present _node-configure_ only supports JSON configuration files.

#Default Behavior

The first time the _node-configure_ module is required by an application, it will attempt to load the file specified
by the `--config` switch relative to the current working directory as obtained via `process.cwd()`. If
_node-configure_ fails to find or load the file, it will throw an exception.

If the `--config` switch is not included as a command line parameter, _node-configure_ will attempt to load the file
"config.json" in the current working directory. If that file is not found, _node-configure_ will throw an exception.

#Changing Default Behavior

_node-configure_ makes use of npm's
[package-level configuration system](http://npmjs.org/doc/config.html#Per-Package-Config-Settings). If you wish to
change the default behavior of _node-configure_ you may do so through this system. After changing a package
configuration option via `npm config set`, you must restart the _node-configure_ package to use the new settings.
For example:

    npm config set configure:notFound throw

    npm restart configure


_node-configure_ supports the following npm configuration keys:

* **notFound**: specifies what _node-configure_ should do when it fails to load a configuration file. Set this value
to "throw" to cause _node-configure_ to throw an exception on a failed load. Any other value will cause _node-configure_
to return null when it fails to load a configuration file.
* **defaultConfigFile**: specifies the file _node-configure_ should attempt to load if no file is specified via
command line.
* **commandLineSwitchName**: specifies the command line switch _node-configure_ should look for to determine which
configuration file to load. Change this value if you or some other module already use `--config`

