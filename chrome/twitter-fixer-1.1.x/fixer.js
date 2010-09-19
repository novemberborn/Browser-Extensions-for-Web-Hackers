function parseUrls(){
  // Bit.ly URLs have a domain followed by a hash, which is five (or more)
  // ASCII letters or digits.
  var reMatchHash = /^http:\/\/.+\..+\/(\w{5,})$/;
  
  var urls = [];
  var urlToLinkNode = {};
  Array.prototype.slice.call(document.querySelectorAll("a[href]")).forEach(function(link){
    link.removeAttribute("target");
    
    var url = link.href;
    
    // Shortened links have a text value equal to their URL.
    // Skip links for which this is not the case.
    // This does ignore links with a custom name, but those
    // are more readable anyway.
    if(link.textContent != url){ return; }
    
    // Find our hash
    var matches = url.match(reMatchHash);
    if(!matches){ return; }
    
    urls.push(url);
    // If we want to change the link, we'll have to keep a reference.
    // Note that the same url can be used multiple times on the page,
    // so store in an array.
    if(!urlToLinkNode[url]){ urlToLinkNode[url] = []; }
    urlToLinkNode[url].push(link);
  });
  
  return { urls: urls, nodes: urlToLinkNode };
}

// Send a message to the background page to get the expanded URL
// for the hashes. It'll invoke our callback function with a
// mapping object from hash to expanded URL.
var parsed = parseUrls();
chrome.extension.sendRequest(parsed.urls, function(mapping){
  for(var url in mapping){
    parsed.nodes[url].forEach(function(link){
      link.textContent = mapping[url];
    });
  }
});
