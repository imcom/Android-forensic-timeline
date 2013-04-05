
// dataset is polymorphism, can be an array of events or a single event
function BrowserHistory(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "title",
    "url",
    "user_entered",
    "visits",
    "bookmark",
    "date"
];*/
BrowserHistory.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.url,
                date: data.date,
                msg: data.url + "[" + data.visits + "]",
                display: data.title
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

BrowserHistory.prototype.getIdField = function() {
    return "_id";
}

BrowserHistory.prototype.getObjectField = function() {
    return "object";
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
