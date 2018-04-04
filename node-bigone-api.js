/* ============================================================
 * node-bigone-api
 https://github.com/ZhiweiWang/node-bigone-api
 * ============================================================
 * Copyright 2018-, Zhiwei Wang
 * Released under the GPL 3.0 License
 * ============================================================ */

module.exports = (function() {
    "use strict";
    const request = require("request");
    const crypto = require("crypto");
    const file = require("fs");
    const stringHash = require("string-hash");
    const md5 = require("md5");
    const _ = require("underscore");
    const util = require("util");
    const VError = require("verror");
    const uuidv4 = require("uuid/v4");
    const base = "https://api.big.one/";
    const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.183 Safari/537.36";
    const contentType = "application/json";
    const default_options = {
        timeout: 30000,
        reconnect: true,
        verbose: false,
        APIKey: false,
        DeviceID: false,
        test: false,
        log: function() {
            console.log(Array.prototype.slice.call(arguments));
        }
    };
    let options = default_options;

    const publicRequest = function(method, params, callback) {
        if (!params) params = {};

        let url = `${base}${method}`;

        let opt = {
            url,
            qs: params,
            method: "GET",
            timeout: options.recvWindow,
            agent: false,
            headers: {
                "User-Agent": userAgent,
                "Content-type": contentType
            }
        };
        request(opt, function(error, response, body) {
            if (!callback) return;

            if (error) return callback(error, {});

            if (response && response.statusCode !== 200) return callback(response, {});

            return callback(null, JSON.parse(body));
        });
    };
    ////////////////////////////
    return {
        markets: function(callback, market = false) {
            if (!callback) return;
            let params = {};
            if (market) {
                publicRequest(`markets/${market.toUpperCase()}`, params, callback);
            } else {
                publicRequest("markets", params, callback);
            }
        },
        setOption: function(key, value) {
            options[key] = value;
        },
        options: function(opt, callback = false) {
            if (typeof opt === "string") {
                // Pass json config filename
                opt = JSON.parse(file.readFileSync(opt));
            }
            for (let key in opt) {
                if (default_options.hasOwnProperty(key)) options[key] = opt[key];
            }

            if (callback) callback();
        }
    };
})();
