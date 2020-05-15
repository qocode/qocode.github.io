(function checkCompatible() {
  var $notml = window.$notml = window.$notml || {};
  $notml.compatible = function compatible() {
    var customElements =
      typeof window.customElements === 'object' &&
      typeof window.customElements.define === 'function' &&
      typeof window.HTMLElement === 'function';
    if (!customElements) {
      return {
        success: false,
        message: 'customElements не поддерживаются'
      }
    }
    try {
      var testFunction = new Function(
        'class TestClass {' +
        '  static get(){};' +
        '  static set(){};' +
        '  static test(){};' +
        '  get(){};' +
        '  set(){};' +
        '  test(){};' +
        '  static a = 1;' +
        '  a = 1;' +
        '  b(){};' +
        '}' +
        'const a = new TestClass()'
      );
      testFunction();
    } catch (error) {
      return {
        success: false,
        message: error.message + '\n\n' + error.stack
      }
    }
    return { success: true, message: '' }
  };
})();

(() => {
  var location = window.location;
  var compatible = window.$notml.compatible();
  if (!compatible.success) {
    location.href = '/not-supported/';
  }
  if (location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    Number.isNaN(Number(location.hostname.split('.').join('')))) {
    location.protocol = 'https:';
  }
})();
