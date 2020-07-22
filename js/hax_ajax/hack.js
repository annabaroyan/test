(function(xhr) {
  var XHR = XMLHttpRequest.prototype;
  var open = XHR.open;
  var send = XHR.send;

  XHR.open = function(method, url) {
    this._url = url;
    this._requestHeaders = {};
    window.postMessage({type: "ajaxStart", url: this._url.split('?')[0]}, '*');
    return open.apply(this, arguments);
  };

  XHR.send = function(postData) {
    this.addEventListener('load', function() {
      if(this._url) {
        try {
            window.postMessage({type: "ajaxEnd", url: this._url.split('?')[0], payload: JSON.parse(this.responseText)}, '*');
        } catch(err) {
            window.postMessage({type: "ajaxEnd", url: this._url.split('?')[0], payload: this.responseText}, '*');
        }
      }
    });
    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
