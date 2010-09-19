document.documentElement.addEventListener("ExtensionNotify", function(evt){
  alert(JSON.parse(document.documentElement.getAttribute("ExtensionNotifyMessage")).msg || "Notified!");
}, false);

var script = document.createElement("script");
script.textContent = 'function notifyContentScript(msg){\n\
  var evt = document.createEvent("Event");\n\
  evt.initEvent("ExtensionNotify", false, false);\n\
  document.documentElement.setAttribute("ExtensionNotifyMessage", JSON.stringify({ msg: msg }));\n\
  document.documentElement.dispatchEvent(evt);\n\
}';
document.body.appendChild(script);
