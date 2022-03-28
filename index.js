(function(exports) {
    ///////////////// class ////////////////////
    var pkg = {
        logger: require('log-instance').LogInstance.singleton,
        RestBundle: require("./src/rest-bundle"),
        RbServer: require("./src/rb-server"),
        ResourceMethod: require("./src/resource-method"),
        RbHash: require("./src/rb-hash"),
        Scheduler: require("./src/scheduler"),
        UserStore: require("./src/user-store"),
    };

    module.exports = exports.RestBundle = pkg;
})(typeof exports === "object" ? exports : (exports = {}));

