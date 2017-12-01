"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elasticsearch_1 = require("elasticsearch");
var es = new elasticsearch_1.Client({
    host: process.env.ELASTICSEARCH_URL,
});
exports.handler = function (event, context, callback) {
    es.search({
        body: {
            "aggs": {
                "date": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "1M",
                        "time_zone": "UTC",
                        "format": "yyyy-MM-dd",
                        "min_doc_count": 1,
                    },
                    "aggs": {
                        "channel": {
                            "terms": {
                                "field": "channel.keyword",
                                "size": 5,
                                "order": {
                                    "_count": "desc",
                                },
                            },
                        },
                    },
                },
            },
        },
    })
        .then(function (r) {
        var data = [];
        r.aggregations.date.buckets.forEach(function (bucket) {
            bucket.channel.buckets.forEach(function (channel) {
                data.push({
                    "x": bucket.key_as_string,
                    "y": channel.doc_count,
                    "group": channel.key,
                });
            });
        });
        var response = {
            statusCode: 200,
            headers: {},
            body: JSON.stringify(data),
        };
        callback && callback(null, response);
    }).catch(function (e) { callback && callback(e, undefined); });
};

