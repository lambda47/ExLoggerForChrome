(function() {
    var responseQuene = [];
    chrome.webRequest.onCompleted.addListener(function(details) {
        chrome.tabs.sendMessage(details.tabId, {details: details}, function(response) {
            if (!response) {
                responseQuene.push(details);
            }
        });
    }, {urls: ["<all_urls>"]}, ["responseHeaders"]);

    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        if (request === 'ready') {
            sendResponse(responseQuene);
            responseQuene = [];
        }
    });
})();

