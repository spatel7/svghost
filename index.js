var ff = require('ff');

var phantom = null;

module.exports = function (selection, next) {
  var page = null;
  var html = selection.node().outerHTML;
  var size = {
      width: selection.attr('width')
    , height: selection.attr('height')
  };
  
  var f = ff(function () {
    module.exports.getPhantom(f.waitPlain());
  }, function () {
    phantom.createPage(f.slotPlain());
  }, function (obj) {
    page = obj;
    
    page.set('viewportSize', size, f.waitPlain());
    page.set('content', html, f.waitPlain());
  }, function () {
    page.renderBase64('png', f.slotPlain());
  }, function (data) {
    page.close();
    
    f.pass(new Buffer(data, 'base64'));
  }).onComplete(next);
};

module.exports.startPhantom = function (next) {
  var f = ff(function () {
    require('phantom').create(f.slotPlain());
  }, function (proc) {
    module.exports.setPhantom(proc);
    module.exports.getPhantom(f.slot());
  }).onComplete(next);
};

module.exports.stopPhantom = function () {
  phantom.exit();
  phantom = null;
};

module.exports.getPhantom = function (next) {
  if (phantom) {
    setImmediate(next, null, phantom);
  } else {
    module.exports.startPhantom(next);
  }
};

module.exports.setPhantom = function (proc) {
  phantom = proc;
};