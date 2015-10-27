/**
 * Actiosn for cross-page communications.
 */
define([
    'lib/aopUtil', 'lib/multiPageUtil', 'lib/util', 'components/saves/saves', 'components/sense/sense'],
    function(aopUtil, multiPageUtil, util, saves, sense) {
  'use strict';
  var self;
  
  var setActive = function() {
    multiPageUtil.init();
  };
  
  self = {
    init: function() {
      // Set as main page when loaded.
      setActive();
      
      // Broadcast when saving.
      aopUtil.after(saves, 'save', function() {
        multiPageUtil.controller.postSubPages('dataSaved');
      });
      
      // Reset itself to be a main page when actions detected.
      util.addEventListener(document.body, 'mousemove', setActive);
      util.addEventListener(document.body, 'click', setActive);
      
      multiPageUtil.controller.addPostListener('dataSaved', function() {
        sense.clearSense();
        saves.load();
        sense.setSense();
        sense.renderLoadedMsgs();
      });
    }
  };
  
  self.init();
  
  return self;
});