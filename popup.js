const normalTypes = [
    "image",
    "video",
    "document"
];

const advancedTypes = [
    ["image", "jpg"],
    ["image", "jpeg"],
    ["image", "png"],
    ["image", "bmp"],
    ["image", "gif"],
    ["video", "mp4"],
    ["video", "webm"],
    ["document", "pdf"]
];

document.addEventListener("DOMContentLoaded", function () {
    onLoad();
}, false);

function onLoad() {
    pictureer.init();
    pictureer.uiTypeLoad();
    pictureer.typeSelectionLoad();
    pictureer.uiTypeDisplay();
    //pictureer.typeSelectionSave();
}

class NormalType {
    constructor(type) {
        this.type = type;
        this.selected = false;
    }
}

class AdvancedType {
    constructor(type, subtype) {
        this.type = type;
        this.subtype = subtype;
        this.selected = false;
    }
}

var pictureer = {
    uiType: "Normal",
    normalTypes: [],
    advancedTypes: [],
    searchResult: [],
    downloadProgress: 0,
    init: function () {

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action in pictureer) {
                pictureer[request.action](request, sender, sendResponse);
            }
        });

        document.getElementById("popup-btnUiType_Normal").addEventListener("click", function () {
            pictureer.uiType = "Normal";
            pictureer.uiTypeDisplay();
            pictureer.uiTypeSave();
        }, false);

        document.getElementById("popup-btnUiType_Advanced").addEventListener("click", function () {
            pictureer.uiType = "Advanced";
            pictureer.uiTypeDisplay();
            pictureer.uiTypeSave();
        }, false);

        document.getElementById("popup-btnMenu_statistics").addEventListener("click", function () {
            pictureer.statistics();
        }, false);

        document.getElementById("popup-btnMenu_close").addEventListener("click", function () {
            pictureer.close();
        }, false);

        document.getElementById("popup-btnMenu_search").addEventListener("click", function () {
            pictureer.search();
        }, false);

        document.getElementById("popup-btnMenu_download").addEventListener("click", function () {
            pictureer.download();
        }, false);

        normalTypes.forEach(type => {
            this.normalTypes.push(new NormalType(type));
            document.getElementById("popup-uiNormal").appendChild(tools.createElement(
                    "div",
                    "popup-typeBox_" + type,
                    ["popup-typeBox"],
                    ""
                    ));
            document.getElementById("popup-typeBox_" + type).appendChild(tools.createElement(
                    "button",
                    "popup-btnSelect_" + type,
                    ["popup-btnSelector"],
                    tools.firstToUpperCase(type)
                    ));
            document.getElementById("popup-typeBox_" + type).appendChild(tools.createElement(
                    "div",
                    "popup-occurenceDisplay_" + type,
                    ["popup-occurenceDisplay", "displayNone"],
                    "0"
                    ));
        });

        advancedTypes.forEach(type => {
            this.advancedTypes.push(new AdvancedType(type[0], type[1]));
            document.getElementById("popup-uiAdvanced").appendChild(tools.createElement(
                    "div",
                    "popup-typeBox_" + type[1],
                    ["popup-typeBox"],
                    ""
                    ));
            document.getElementById("popup-typeBox_" + type[1]).appendChild(tools.createElement(
                    "button",
                    "popup-btnSelect_" + type[1],
                    ["popup-btnSelector"],
                    "." + type[1]
                    ));
            document.getElementById("popup-typeBox_" + type[1]).appendChild(tools.createElement(
                    "div",
                    "popup-occurenceDisplay_" + type[1],
                    ["popup-occurenceDisplay", "displayNone"],
                    "0"
                    ));
        });

        for (let i = 0; i < this.normalTypes.length; i++) {
            document.getElementById("popup-btnSelect_" + this.normalTypes[i].type).addEventListener("click", function () {
                pictureer.selectNormalType(pictureer.normalTypes[i].type);
                pictureer.typeSelectionDisplay();
                pictureer.typeSelectionSave();
            }, false);
        }

        for (let i = 0; i < this.advancedTypes.length; i++) {
            document.getElementById("popup-btnSelect_" + this.advancedTypes[i].subtype).addEventListener("click", function () {
                pictureer.selectAdvancedType(pictureer.advancedTypes[i].subtype);
                pictureer.typeSelectionDisplay();
                pictureer.typeSelectionSave();
            }, false);
        }
    },
    uiTypeLoad: function () {
        chrome.storage.sync.get('uiType', function (data) {
            if (data.uiType != undefined && data.uiType != null) {
                pictureer.uiType = data.uiType;
                pictureer.uiTypeDisplay();
            }
        });
    },
    uiTypeSave: function () {
        chrome.storage.sync.set({
            uiType: this.uiType
        });
    },
    uiTypeDisplay: function () {

        if (this.uiType == "Normal") {
            document.getElementById("popup-btnUiType_Normal").classList.add("popup-btnSelected");
            document.getElementById("popup-btnUiType_Advanced").classList.remove("popup-btnSelected");

            document.getElementById("popup-uiNormal").classList.remove("displayNone");
            document.getElementById("popup-uiAdvanced").classList.add("displayNone");
        }

        if (this.uiType == "Advanced") {
            document.getElementById("popup-btnUiType_Normal").classList.remove("popup-btnSelected");
            document.getElementById("popup-btnUiType_Advanced").classList.add("popup-btnSelected");

            document.getElementById("popup-uiNormal").classList.add("displayNone");
            document.getElementById("popup-uiAdvanced").classList.remove("displayNone");
        }
    },
    typeSelectionLoad: function () {
        chrome.storage.sync.get('normalTypes', function (data) {
            if (data.normalTypes != undefined && data.normalTypes != null) {
                pictureer.normalTypes = data.normalTypes;
                pictureer.typeSelectionDisplay();
            }
        });
        chrome.storage.sync.get('advancedTypes', function (data) {
            if (data.advancedTypes != undefined && data.advancedTypes != null) {
                pictureer.advancedTypes = data.advancedTypes;
                pictureer.typeSelectionDisplay();
            }
        });
    },
    typeSelectionSave: function () {
        chrome.storage.sync.set({
            normalTypes: this.normalTypes,
            advancedTypes: this.advancedTypes
        });
    },
    typeSelectionDisplay: function () {
        this.normalTypes.forEach(type => {
            if (type.selected) {
                document.getElementById("popup-btnSelect_" + type.type).classList.add("popup-btnSelected");
            } else {
                document.getElementById("popup-btnSelect_" + type.type).classList.remove("popup-btnSelected");
            }
        });

        this.advancedTypes.forEach(type => {
            if (type.selected) {
                document.getElementById("popup-btnSelect_" + type.subtype).classList.add("popup-btnSelected");
            } else {
                document.getElementById("popup-btnSelect_" + type.subtype).classList.remove("popup-btnSelected");
            }
        });
    },
    selectNormalType: function (type) {
        let selected = false;
        this.normalTypes.forEach(t => {
            if (t.type == type) {
                t.selected = !t.selected;
                selected = t.selected;
            }
        });

        this.advancedTypes.forEach(t => {
            if (type == t.type) {
                t.selected = selected;
            }
        });
    },
    selectAdvancedType: function (type) {
        this.advancedTypes.forEach(t => {
            if (type == t.subtype) {
                t.selected = !t.selected;
            }
        });
    },
    search: function () {
        chrome.runtime.sendMessage({
            action: 'search',
            fileTypes: JSON.stringify(this.advancedTypes)
        });
    },
    download: function () {
        if (this.searchResult.length > 0) {
            chrome.runtime.sendMessage({
                action: 'download'
            });

            this.disableCloseDownload();
        }
    },
    close: function () {
        if (this.searchResult.length > 0) {
            chrome.runtime.sendMessage({
                action: 'close'
            });

            this.downloadProgress = 0;
            this.searchResult.length = 0;
            this.hideSearchResults();
            document.getElementById("popup-progressBar").innerHTML = "";
            document.getElementById("popup-progressBar").classList.add("displayNone");
            this.disableCloseDownload();
        }
    },
    statistics: function () {

    },
    setSearchResult: function (request, sender, sendResponse) {
        this.searchResult = JSON.parse(request.searchResult);

        let out = "<div class='popup-progressBar_searchResult'><div>Occurences:</div><div>" + this.searchResult.length + "</div></div>";

        document.getElementById("popup-progressBar").innerHTML = out;
        document.getElementById("popup-progressBar").classList.remove("displayNone");

        this.showSearchResults();

        if (this.searchResult.length > 0) {
            this.enableCloseDownload();
        }
    },
    addDownloadProgress: function (request, sender, sendResponse) {
        this.downloadProgress++;
        let out = "<div class='popup-progressBar_downloadProgress'><div class='popup-progressBar_progress' style='width: " + (this.downloadProgress / this.searchResult.length * 100) + "%'></div><div><div>Downloading:</div><div>" + this.downloadProgress + " / " + this.searchResult.length + "</div></div></div>";
        document.getElementById("popup-progressBar").innerHTML = out;

        if (this.downloadProgress == this.searchResult.length) {
            chrome.runtime.sendMessage({action: "delayRun", delayedFunction: "setDownloadProgressFinished", delay: 1000});
        }
    },
    setDownloadProgressFinished: function () {
        let out = "<div class='popup-progressBar_downloadProgress'><div class='popup-progressBar_progress' style='width: 100%'></div><div><div>Downloading:</div><div>Completed</div></div></div>";
        document.getElementById("popup-progressBar").innerHTML = out;
        this.downloadProgress = 0;
        this.searchResult.length = 0;

        chrome.runtime.sendMessage({action: "delayRun", delayedFunction: "removeDownloadProgress", delay: 1000});
    },
    removeDownloadProgress: function () {
        this.hideSearchResults();
        document.getElementById("popup-progressBar").innerHTML = "";
        document.getElementById("popup-progressBar").classList.add("displayNone");
    },
    showSearchResults: function () {
        this.normalTypes.forEach(t => {
            document.getElementById("popup-occurenceDisplay_" + t.type).classList.remove("displayNone");
            document.getElementById("popup-occurenceDisplay_" + t.type).innerHTML = pictureer.getNumberOfFilesOfType(t.type) + "";
        });

        this.advancedTypes.forEach(t => {
            document.getElementById("popup-occurenceDisplay_" + t.subtype).classList.remove("displayNone");
            document.getElementById("popup-occurenceDisplay_" + t.subtype).innerHTML = pictureer.getNumberOfFilesOfSubtype(t.subtype) + "";
        });
    },
    hideSearchResults: function () {
        this.normalTypes.forEach(t => {
            document.getElementById("popup-occurenceDisplay_" + t.type).classList.add("displayNone");
        });

        this.advancedTypes.forEach(t => {
            document.getElementById("popup-occurenceDisplay_" + t.subtype).classList.add("displayNone");
        });
    },
    getNumberOfFilesOfType: function (type) {
        let count = 0;

        this.advancedTypes.forEach(t => {
            if (t.type == type) {
                count += pictureer.getNumberOfFilesOfSubtype(t.subtype);
            }
        });
        return count;
    },
    getNumberOfFilesOfSubtype: function (subtype) {
        let count = 0;

        this.searchResult.forEach(r => {
            if (r.fileType == subtype) {
                count++;
            }
        });
        return count;
    },
    enableCloseDownload: function () {
        document.getElementById("popup-btnMenu_close").classList.remove("btnDisabled");
        document.getElementById("popup-btnMenu_download").classList.remove("btnDisabled");
    },
    disableCloseDownload: function () {
        document.getElementById("popup-btnMenu_close").classList.add("btnDisabled");
        document.getElementById("popup-btnMenu_download").classList.add("btnDisabled");
    }
};

var tools = {
    /**
     * 
     * @param {String} type
     * @param {String} id
     * @param {ArrayOfStrings} classes
     * @param {String} innerHTML
     * @returns {Element} Returns HTML Element with given parameters
     */
    createElement: function (type, id, classes, innerHTML) {
        let el = document.createElement(type);
        el.innerHTML = innerHTML;
        el.setAttribute("id", id);
        classes.forEach(c => {
            el.classList.add(c);
        });
        return el;
    },
    /**
     * 
     * @param {String} text
     * @returns {String} Text with first character capitalized 
     */
    firstToUpperCase: function (text) {
        return text.replace(/^\w/, c => c.toUpperCase());
    }
};
