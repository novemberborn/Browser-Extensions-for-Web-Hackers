var links = document.querySelectorAll("a[target=_blank]");
Array.prototype.slice.call(links).forEach(function(a){
  a.removeAttribute("target");
});
