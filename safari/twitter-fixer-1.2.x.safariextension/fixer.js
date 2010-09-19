safari.self.addEventListener("message", function(evt){
  switch(evt.name){
    case "settings":
      onSettings(evt.message);
      break;
    case "mappingComplete":
      onMappingComplete(evt.message);
      break;
  }
}, false);

safari.self.tab.dispatchMessage("readSettings", ["sameWindow", "expandURLs"]);

function parseUrls(settings){
  // Bit.ly URLs have a domain followed by a hash, which is five (or more)
  // ASCII letters or digits.
  var reMatchHash = /^http:\/\/.+\..+\/(\w{5,})$/;
  
  var urls = [];
  var urlToLinkNode = {};
  Array.prototype.slice.call(document.querySelectorAll("a[href]")).forEach(function(link){
    settings.sameWindow && link.removeAttribute("target");
    
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

var parsed;
function onMappingComplete(mapping){
  for(var url in mapping){
    parsed.nodes[url].forEach(function(link){
      link.textContent = mapping[url];
    });
  }
}

function onSettings(settings){
  parsed = parseUrls(settings);
  settings.expandURLs && safari.self.tab.dispatchMessage("expandURLs", parsed.urls);
}
