
(typeof describe === 'function') && describe("RbServer", function() {
    const supertest = require("supertest");
    const should = require("should");
    const fs = require("fs");
    const path = require("path");
    const pkg = require("../package.json");
    const {
        logger,
        RbServer,
        RestBundle,
    } = require("../index.js");

    const express = require("express");
    const RbHash = require("../index.js").RbHash;
    var rbh = new RbHash();
    logger.level = "warn";
    RbServer.logDefault();

    it("logger", function() {
        logger.warn("Testing", path.basename(__filename));
    });
    it("Last TEST closes test suite for watch", function() {
        var app = require("../scripts/server.js");
        app.locals.rbServer && app.locals.rbServer.close();
    });
})
