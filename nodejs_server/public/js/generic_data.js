
function GenericData(type, dataset) {

    this.data_handler = null;
    if (type === 'android_log_schema') {
        this.data_handler = new AndroidLogs(dataset);
    }

    if (type === 'content_provider_browsersearches') {
        this.data_handler = new BrowserSearches(dataset);
    }

    if (type === 'content_provider_browserhistory') {
        this.data_handler = new BrowserHistory(dataset);
    }

}

GenericData.prototype.getDate = function(index) {
    return this.data_handler.getDate(index);
}

GenericData.prototype.getId = function() {
    return this.data_handler.getId();
}

GenericData.prototype.getMessage = function() {
    return this.data_handler.getMessage();
}

GenericData.prototype.getDisplayName = function() {
    return this.data_handler.getDisplayName();
}