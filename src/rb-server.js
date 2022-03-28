/**
 * RbServer is the RestBundle for a server singleton
 * that manages shared resources such as rb-singleton.
 */
(function(exports) {
    const logger = require("log-instance").LogInstance.singleton;
    const fs = require('fs');
    const path = require('path');
    const https = require('https');
    const RestBundle = require("./rest-bundle");
    const WEB_SOCKET_MODEL = "RbServer.web-socket";
    var LOCAL_PATH = path.join(process.cwd(), 'local');
    if (!fs.existsSync(LOCAL_PATH)) {
        LOCAL_PATH = path.join(process.cwd(), '..', 'local');
    }

    class RbServer extends RestBundle {
        constructor(name=WEB_SOCKET_MODEL, options = {}) {
            super("RbServer", RbServer.initOptions(options));
            this.sslPath = options.sslPath;
        }
        
        static initOptions(options) {
            options = Object.assign({
                srcPkg: require("../package.json"),
            }, options);
            options.logDefault && options.logDefault() || this.logDefault();
            return options;
        }

        static logDefault() {
            // deprecated
        }

        get handlers() {
            return super.handlers.concat([
                this.resourceMethod("get", "web-socket", this.getWebSocket),
                this.resourceMethod("put", "web-socket", this.putWebSocket),
            ]);
        }

        close() {
            if (this.rootApp) {
                if (this.httpServer) {
                    logger.info("closing web server");
                    this.httpServer && this.httpServer.close();
                }
            }
        }

        listen(app, restBundles, ports=[80,8080]) {
            ports = ports.concat(new Array(100).fill(3000).map((p,i) => p+i));
            try {
                if (this.httpServer) {
                    throw new Error(this.constructor.name + ".listen() can only be called once");
                }
                if (restBundles.filter(rb=>rb===this)[0] == null) {
                    restBundles.push(this);
                }
                restBundles.forEach(rb => rb.bindExpress(app));

                this.httpServer = ports.reduce( (listener, port) => {
                    return listener.listening && listener
                    || app.listen(port).on('error', function(error) {
                        if (error.code === "EACCES") { 
                            // 80 requires root
                        } else if (error.code === "EADDRINUSE" ) {
                            // supertest doesn't release port
                        } else { 
                            throw error; 
                        }
                    })
                }, {});
                if (!this.httpServer.listening) {
                    throw new Error(
                        `Could not create HTTP listener for any ports:${ports}`);
                }
            } catch (err) {
                logger.error('rb-server:', err.stack);
                throw err;
            }
            return this;
        }

        listenSSL(app, restBundles, sslOpts) {
            try {
                var sslPath = this.sslPath;
                if (sslPath == undefined) {
                    sslPath = path.join(LOCAL_PATH, 'ssl');
                }
                if (!fs.existsSync(sslPath)) {
                    throw new Error(
                        `Could not find SSL folder at sslPath:${sslPath}`);
                }
                sslOpts = sslOpts || {
                    cert: fs.readFileSync(path.join(sslPath, 'server.crt')),
                    key: fs.readFileSync(path.join(sslPath, 'server.key')),
                };
                if (this.httpsServer) {
                    throw new Error(this.constructor.name + 
                        ".listenSSL() can only be called once");
                }
                if (restBundles.filter(rb=>rb===this)[0] == null) {
                    restBundles.push(this);
                }
                restBundles.forEach(rb => rb.bindExpress(app));
                var server = https.createServer(sslOpts, app);
                this.httpServer = server.listen(443);
                if (!this.httpServer.listening) {
                    throw new Error(`Could not create HTTPS listener`);
                }
            } catch (err) {
                logger.error('rb-server:', err.stack);
                throw err;
            }
            return this;
        }

    } // class RbServer

    module.exports = exports.RbServer = RbServer;
})(typeof exports === "object" ? exports : (exports = {}));
