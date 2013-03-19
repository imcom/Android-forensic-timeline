
// dataset is polymorphism, can be an array of events or a single event
function BrowserSearches(dataset) {
    this.dataset = dataset;
}

BrowserSearches.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

BrowserSearches.prototype.getId = function() {
    return this.dataset._id;
}

BrowserSearches.prototype.getMessage = function() {
    return this.dataset.search;
}

BrowserSearches.prototype.getDisplayName = function() {
    return "Browser search";
}