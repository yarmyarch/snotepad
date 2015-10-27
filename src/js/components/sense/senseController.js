/**
 * Controller focused on making sense changes as well as data changes for saved data.
 */
define(
    ['lib/aopUtil', 'components/saves/saves'],
    function(aopUtil, saves) {
  'use strict';
  var self;
  
  // Model data
  var buf = {
    currentMsg: {},
    bgColor: ''
  };
  
  self = {
    init: function() {
      // Set save/load actions
      aopUtil.before(saves, 'save', function() {
        this.saveValue('bgColor', buf.bgColor);
      });
      
      aopUtil.after(saves, 'load', function() {
        buf.bgColor = this.getValue('bgColor');
      });
    },
    
    saveCurrentMessage: function() {
      saves.save();
    },
    
    setCurrentMessage: function(msg) {
      buf.currentMsg = msg;
    },
    
    getCurrentMessage: function() {
      return buf.currentMsg;
    },
    
    getBgColor: function() {
      return buf.bgColor;
    },
    
    setBgColor: function(colorCode) {
      buf.bgColor = colorCode;
      saves.save();
    }
  };
  
  self.init();
  
  return self;
});