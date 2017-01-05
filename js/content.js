(function() {

    function logTable(title, obj) {
        console.info('%s:', title);
        var tableData = [];
        for (var k in obj) {
            tableData.push({key: k, value: obj[k]});
        }
        console.table(tableData);
    }

    function logProfilerInfo(responseHeaders) {
        for (var i = 0; i < responseHeaders.length; i++) {
            if (responseHeaders[i].name === 'EXLOGGER') {
                var profilerData = JSON.parse(responseHeaders[i].value);
                var requestName = '';
                if (profilerData.DIRECTORY.length > 0)
                {
                    requestName = profilerData.DIRECTORY + '/';
                }
                requestName += (profilerData.CONTROLLER + '=>' + profilerData.ACTION);
                console.group(requestName) ;
                if (profilerData.GET) {
                    logTable('GET', profilerData.GET)
                }
                if (profilerData.POST) {
                    logTable('POST', profilerData.POST)
                }
                if (profilerData.SESSION) {
                    logTable('SESSION', profilerData.SESSION)
                }
                if (profilerData.QUERIES)
                {
                    for (var j = 0; j < profilerData.QUERIES.length; j++) {
                        console.info('%s(%f microsecond)', profilerData.QUERIES[j].sql, profilerData.QUERIES[j].time);
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