
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

    if (type === 'content_provider_apps') {
        this.data_handler = new Applications(dataset);
    }

    if (type === 'content_provider_calllogs') {
        this.data_handler = new CallLogs(dataset);
    }

    if (type === 'content_provider_contacts') {
        this.data_handler = new Contacts(dataset);
    }

    if (type === 'content_provider_mms') {
        this.data_handler = new MMS(dataset);
    }

    if (type === 'content_provider_sms') {
        this.data_handler = new SMS(dataset);
    }

    if (type === 'content_provider_services') {
        this.data_handler = new Services(dataset);
    }

    if (type === 'fs_time_schema') {
        this.data_handler = new FSTime(dataset);
    }

    if (type === 'inode_time_schema') {
        this.data_handler = new InodeTime(dataset);
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