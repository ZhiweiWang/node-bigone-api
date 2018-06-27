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
    const moment = require("moment");
    const file = require("fs");
    const base = "https://big.one/api/v2/";
    const base_kline = "https://b1.run/api/graphql";
    const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.183 Safari/537.36";
    const default_options = {
        timeout: 30000,
        reconnect: true,
        verbose: false,
        APIKey: false,
        DeviceID: false,
        log: function() {
            console.log(Array.prototype.slice.call(arguments));
        }
    };
    let options = default_options;

    const publicRequest = function(url, params, callback, method = "GET", payload = false) {
        // let functionName = "publicRequest()";
        if (!params) params = {};

        let req_options = {
            url,
            method,
            headers: {
                "User-Agent": userAgent
            },
            timeout: options.timeout,
            qs: params,
            json: true
        };
        if (payload) req_options.body = payload;

        executeRequest(req_options, callback);
    };

    const executeRequest = function(req_options, callback) {
        // let functionName = "executeRequest()";

        request(req_options, function(err, response, body) {
            if (!callback) return;

            if (err) return callback(err, {});

            if (response && response.statusCode !== 200) return callback(response, {});

            return callback(false, body);
        });
    };
    ////////////////////////////
    return {
        markets: function(callback) {
            if (!callback) return;
            publicRequest(base + "markets", false, callback);
        },
        kline: function(marketId, period, startTime, endTime, callback) {
            if (!callback) return;
            if (!endTime) endTime = moment().toISOString();
            if (!startTime)
                startTime = moment(endTime)
                    .subtract(10, "day")
                    .toISOString();
            let payload = {
                variables: { marketId, period, startTime, endTime },
                query:
                    "query ($marketId: String!, $period: BarPeriod!, $startTime: DateTime, $endTime: DateTime) {\n  bars(marketUuid: $marketId, period: $period, startTime: $startTime, endTime: $endTime, order: DESC, limit: 1000) {\n    time\n    open\n    high\n    low\n    close\n    volume\n    __typename\n  }\n}\n"
            };
            publicRequest(base_kline, false, callback, "POST", payload);
        },
        setOption: function(key, value) {
            options[key] = value;
        },
        options: function(opt, callback = false) {
            if (typeof opt === "string") {
                // Pass json config filename
                opt = JSON.parse(file.readFileSync(opt));
            }
            options = Object.assign(default_options, opt);

            if (callback) callback();
        }
    };
})();
