function parseUrls(){
  // Bit.ly URLs have a domain followed by a hash, which is six (or more)
  // ASCII letters or digits.
  var reMatchHash = /^http:\/\/.+\..+\/(\w{6,})$/;
  
  var hashes = [];
  var hashToLink = {};
  Array.prototype.slice.call(document.querySelectorAll("a[href]")).forEach(function(link){
    link.removeAttribute("target");
    
    var url = link.href;
    
    // Shortened links have a text value equal to their URL.
    // Skip links for which this is not the case.
    // This does ignore links with a custom nome, but those
    // are more readable anyway.
    if(link.textContent != url){ return; }
    
    // Find our hash
    var matches = url.match(reMatchHash);
    if(!matches){ return; }
    
    var hash = matches[1];
    hashes.push(hash);
    // If we want to change the link, we'll have to keep a reference.
    // Note that the same hash can be used multiple times on the page,
    // so store in an array.
    if(!hashToLink[hash]){ hashToLink[hash] = []; }
    hashToLink[hash].push(link);
  });
  
  return { hashes: hashes, links: hashToLink };
}

// Send a message to the background page do get the expanded URL
// for the hashes. The background page will send a message to us
// with a  mapping object from hash to expanded URL.
var parsed = parseUrls();
safari.self.addEventListener("message", function(evt){
  if(evt.name == "mappingComplete"){
    var mapping = evt.message;
    for(hash in mapping){
      parsed.links[hash].forEach(function(link){
        link.textContent = mapping[hash];
      });
    }
  }
}, false);
safari.self.tab.dispatchMessage("expandHashes", parsed.hashes);
