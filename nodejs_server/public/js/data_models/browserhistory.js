
// dataset is polymorphism, can be an array of events or a single event
function BrowserHistory(dataset) {
    this.dataset = dataset;
}

BrowserHistory.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

BrowserHistory.prototype.getId = function() {
    return 0; // no id info
}

BrowserHistory.prototype.getMessage = function() {
    return this.dataset.url;
}

BrowserHistory.prototype.getDisplayName = function() {
    return this.dataset.title;
}