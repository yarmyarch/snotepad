/**
 * Module for saving & loading data using LocalStorage
 */
define(['config', 'lib/multiPageUtil'], function(config, lsUtil) {
  'use strict';
  var self;
  
  var buf = {
    savedData: {}
  };
  
  return self = {
    save: function() {
      lsUtil.util.set(config.DATA_KEY, btoa(JSON.stringify(buf.savedData)));
    },
    
    load: function() {
      var data = lsUtil.util.get(config.DATA_KEY);
      if (!data) {
        return;
      }
      buf.savedData = JSON.parse(atob(data));
    },
    
    getValue: function(key) {
      return buf.savedData[key];
    },
    
    saveValue: function(key, value) {
      buf.savedData[key] = value;
    }
  };
});