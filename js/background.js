(function() {
    var responseQuene = [];

    if (localStorage.enabled == null) {
        localStorage.enabled = 'y';
    }

    function displayIcon() {
        if (localStorage.enabled === 'y') {
            chrome.browserAction.setIcon({path: '../icon/icon_48.png'});
        } else {
            chrome.browserAction.setIcon({path: '../icon/icon_48_black.png'});
        }
    }

    displayIcon();

    chrome.webRequest.onCompleted.addListener(function(details) {
        if (localStorage.enabled === 'y') {
            chrome.tabs.sendMessage(details.tabId, {details: details}, function (response) {
                if (!response) {
                    responseQuene.push(details);
                }
            });
        }
    }, {urls: ["<all_urls>"]}, ["responseHeaders"]);

    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        if (request === 'ready') {
            if (localStorage.enabled === 'y') {
                sendResponse(responseQuene);
            }
            responseQuene = [];
        }
    });

    chrome.browserAction.onClicked.addListener(function(tab) {
        localStorage.enabled = localStorage.enabled === 'y' ? 'n' : 'y';
        displayIcon();
    });
})();

