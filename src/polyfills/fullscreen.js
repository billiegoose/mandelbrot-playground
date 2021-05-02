// oh safari, bane of life
if (typeof document.fullscreenEnabled === 'undefined' && typeof document.webkitFullscreenEnabled === 'boolean') {
  // Polyfill the dang things
  Object.defineProperties(document, {
    fullscreenEnabled: {
      get: function () {
        return this.webkitFullscreenEnabled;
      },
    },
    fullscreenElement: {
      get: function () {
        return this.webkitFullscreenElement;
      },
    },
    exitFullscreen: {
      get: function () {
        return this.webkitExitFullscreen;
      },
    },
  });
  Object.defineProperties(Element.prototype, {
    requestFullscreen: {
      get: function () {
        return this.webkitRequestFullscreen;
      },
    },
  });
}
