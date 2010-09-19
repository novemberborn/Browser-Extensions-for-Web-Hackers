var hybrid = new function(){
  var isSafari = typeof safari != "undefined";
  var isChrome = typeof chrome != "undefined";
  
  var messageId = 0;
  var callbackMap = {};
  
  this.on = function(type, cb){
    if(isSafari){
      (safari.application || safari.self).addEventListener("message", function(evt){
        if(evt.name != "hybridMessage" || evt.message.type != type){ return; }
        
        var sendResponse = function(payload){
          if(!evt.target.page){ throw new Error("Can't send response, evt.target.page does not exist."); }
          evt.target.page.dispatchMessage("hybridMessage", {
            responseTo: evt.message.id,
            payload: payload
          });
        };
        cb(evt.message.payload, sendResponse);
      }, false);
    }else if(isChrome){
      chrome.extension.onRequest.addListener(function(evt, _, sendResponse){
        if("hybridMessage" in evt && evt.hybridMessage.type == type){
          cb(evt.hybridMessage.payload, sendResponse);
        }
      });
    }
  };
  
  this.send = function(type, payload, cb){
    var message = {
      type: type,
      payload: payload,
      id: messageId++
    };
    
    if(isSafari && !safari.application){
      callbackMap[message.id] = cb;
      safari.self.tab.dispatchMessage("hybridMessage", message);
    }else if(isChrome){
      chrome.extension.sendRequest({ "hybridMessage": message }, cb);
    }
  };
  
  if(isSafari && safari.self && !safari.application){
    safari.self.addEventListener("message", function(evt){
      if(evt.name == "hybridMessage" && evt.message.responseTo in callbackMap){
        var cb = callbackMap[evt.message.responseTo];
        delete callbackMap[evt.message.responseTo];
        cb(evt.message.payload);
      }
    }, false);
  }
};
