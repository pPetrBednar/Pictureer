var handler = {

    init: function () {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action in handler) {
                handler[request.action](request, sender, sendResponse);
            }
        });
    },
    search: function (request, sender, sendResponse) {
        let fileTypes = JSON.parse(request.fileTypes);
        storage.clear();

        chrome.tabs.query({}, function (tabs) {

            tabs.forEach(tab => {
                let url = tools.formatUrl(tab.url);
                if (tools.checkIfSelected(url, fileTypes)) {
                    storage.files.push({url: url, fileType: tools.getFileType(url), id: tab.id});
                }
            });

            chrome.runtime.sendMessage({action: 'setSearchResult', searchResult: JSON.stringify(storage.files)});
        });
    },
    download: async function (request, sender, sendResponse) {

        for (let i = 0; i < storage.files.length; i++) {
            tools.download(storage.files[i].url);
            chrome.runtime.sendMessage({action: "addDownloadProgress"});
            await tools.timer(1000);
        }
        storage.clear();
    },
    close: function (request, sender, sendResponse) {
        storage.files.forEach(f => {
            chrome.tabs.remove(f.id, function () {
            });
        });

        storage.clear();
    },
    delayRun: async function (request, sender, sendResponse) {
        await tools.timer(request.delay);
        chrome.runtime.sendMessage({action: request.delayedFunction});
    }
};

var storage = {
    files: [],
    clear: function () {
        this.files.length = 0;
    }
};

var tools = {
    getFileType: function (url) {
        var data = url.split(".");
        return data[data.length - 1];
    },
    getFileName: function (url) {
        var data = url.split("/");
        return data[data.length - 1];
    },
    timer: function (ms) {
        return new Promise(res => setTimeout(res, ms));
    },
    download: function (url) {
        let link = document.createElement('a');
        link.href = url;
        link.download = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    formatUrl: function (url) {
        /*  return copy = url;
         copy.replace(/%20/g, " ");
         copy.replace(/%28/g, "(");
         copy.replace(/%29/g, ")");*/

        let s = url;
        let n = s.indexOf('?');
        s = s.substring(0, n != -1 ? n : s.length);
        return s;
    },
    checkIfSelected: function (url, fileTypes) {

        let selected = false;
        let fileType = this.getFileType(url);

        fileTypes.forEach(t => {
            if (t.selected) {
                if (fileType == t.subtype) {
                    selected = true;
                }
            }
        });

        return selected;
    }
};

handler.init();