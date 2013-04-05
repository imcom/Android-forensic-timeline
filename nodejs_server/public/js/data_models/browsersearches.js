
// dataset is polymorphism, can be an array of events or a single event
function BrowserSearches(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "date",
    "search"
];*/
BrowserSearches.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: "BrowserSearches",
                date: data.date,
                msg: data.search,
                display: "BrowserSearches"
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

BrowserSearches.prototype.getIdField = function() {
    return "_id";
}

BrowserSearches.prototype.getObjectField = function() {
    return "object";
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
