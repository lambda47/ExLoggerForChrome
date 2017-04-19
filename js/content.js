(function() {

    function logTable(obj) {
        var tableData = [];
        for (var k in obj) {
            if (Array.isArray(obj[k])) {
                for (var i = 0; i < obj[k].length; i++) {
                    tableData.push({key: k + '[]', value: obj[k][i]});
                }
            } else if (obj[k] instanceof Object) {
                for (var sub_k in obj[k]) {
                    tableData.push({key: k + '[' + sub_k + ']', value: obj[k][sub_k]});
                }
            } else {
                tableData.push({key: k, value: obj[k]});
            }
        }
        console.table(tableData);
    }

    function logProfilerInfo(responseHeaders) {
        for (var i = 0; i < responseHeaders.length; i++) {
            if (responseHeaders[i].name === 'EXLOGGER') {
                var profilerData = JSON.parse(responseHeaders[i].value);
                var requestName = '';
                if (profilerData.DIRECTORY.length > 0) {
                    requestName = profilerData.DIRECTORY + '/';
                }
                requestName += (profilerData.CONTROLLER + '=>' + profilerData.ACTION);
                console.group(requestName) ;
                if (profilerData.GET) {
                    console.info('GET:');
                    logTable(profilerData.GET)
                }
                if (profilerData.POST) {
                    console.info('POST:');
                    logTable(profilerData.POST)
                }
                if (profilerData.SESSION) {
                    console.info('SESSION:');
                    logTable(profilerData.SESSION)
                }
                if (profilerData.QUERIES) {
                    console.info('QUERY:');
                    for (var j = 0; j < profilerData.QUERIES.length; j++) {
                        var sqlParser = new Parser(profilerData.QUERIES[j].sql, profilerData.QUERIES[j].time);
                        sqlParser.parse();
                        sqlParser.display();
                        if (profilerData.QUERIES[j].explain != undefined) {
                            for (var k = 0; k < profilerData.QUERIES[j].explain.length; k++) {
                                logTable(profilerData.QUERIES[j].explain[k]);
                            }
                        }
                    }
                }
                console.groupEnd();
                break;
            }
        }
    }

    chrome.extension.sendMessage('ready', function(requestQuene) {
        if (requestQuene) {
            for (var i = 0; i < requestQuene.length; i++) {
                var responseHeaders = requestQuene[i].responseHeaders;
                logProfilerInfo(responseHeaders);
            }
        }
    });

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        var responseHeaders = request.details.responseHeaders;
        logProfilerInfo(responseHeaders);
        sendResponse(true);
    });
})();