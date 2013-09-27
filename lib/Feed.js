var xtend = require('xtend');

function Feed(data) {
  xtend(this, data);
}

Feed.prototype.getNextLink = function() {
  return this.link.filter(function(l){
    return l.rel === 'http://schemas.google.com/g/2005#next';
  })[0];
};

module.exports = Feed;