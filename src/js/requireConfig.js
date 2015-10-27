requirejs.config({
  baseUrl: 'src/js',
  paths: {
    app: 'app'
  },
  shim: {
  }
});

requirejs(['app'], function(app) {
  app.init();
});