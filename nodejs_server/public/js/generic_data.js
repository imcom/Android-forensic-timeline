
function GenericData(type, dataset) {

    this.data_handler = null;
    if (type === 'android_logs') {
        this.data_handler = new AndroidLogs(dataset);
    }

    if (type === 'application_trace') {
        this.data_handler = new ApplicationTrace(dataset);
    }

    if (type === 'dmesg_schema') {
        this.data_handler = new Dmesg(dataset);
    }

    if (type === 'content_provider_browsersearches') {
        this.data_handler = new BrowserSearches(dataset);
    }

    if (type === 'content_provider_browserhistory') {
        this.data_handler = new BrowserHistory(dataset);
    }

    if (type === 'content_provider_applications') {
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

GenericData.prototype.unifyDataset = function() {
    return this.data_handler.unifyDataset();
}

GenericData.prototype.getIdField = function() {
    return this.data_handler.getIdField();
}

GenericData.prototype.getObjectField = function() {
    return this.data_handler.getObjectField();
}

GenericData.prototype.getDate = function(index) {
    return this.data_handler.getDate(index);
}

GenericData.prototype.getId = function(index) {
    return this.data_handler.getId(index);
}

GenericData.prototype.getObject = function(index) {
    return this.data_handler.getObject(index);
}

GenericData.prototype.getMessage = function(index) {
    return this.data_handler.getMessage(index);
}

GenericData.prototype.getDisplayName = function() {
    return this.data_handler.getDisplayName();
}