/**
 * Public API for message actions.
 */
define([
    'config', 'lib/aopUtil', 'lib/util', 'components/saves/saves'],
    function(config, aopUtil, util, saves) {
  'use strict';
  var self;

  var buf = {
    msgOrder: [],
    msgMap: {}
  };
  
  var handlerList = {
    // Returns an array of message ids.
    sortMessage: {
      content: function(a, b) {
        return a.content > b.content ? 1 : -1;
      },
      
      date: function(a, b) {
        return a.date > b.date ? 1 : -1;
      },
      
      title: function(a, b) {
        return a.title > b.title ? 1 : -1;
      },
      
      random: function() {
        return Math.random() - 0.5;
      }
    }
  };
  
  self = {
    init: function() {
      aopUtil.before(saves, 'save', function() {
        this.saveValue('messages', buf.msgMap);
        this.saveValue('msgOrder', buf.msgOrder);
      });
      
      aopUtil.after(saves, 'load', function() {
        buf.msgMap = this.getValue('messages') || buf.msgMap;
        buf.msgOrder = this.getValue('msgOrder') || buf.msgOrder;
        self.resetMessageOrder();
      });
    },
    
    createMessage: function() {
      return {
        id: config.RAND_ID_PREFIX + util.getRandId(),
        title: '',
        content: '',
        date: ''
      };
    },
    
    deleteMessage: function(msgId) {
      delete buf.msgMap[msgId];
      saves.save();
    },
    
    formatMessageDate: function(date) {
      return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ',' + (date.getMonth() - 1) + '/' + date.getDate() + '/' + date.getFullYear();
    },
    
    getMessage: function(msgId) {
      return buf.msgMap[msgId];
    },
    
    getAllMessages: function() {
      return buf.msgMap;
    },
    
    saveMessage: function(msg) {
      msg && msg.id && (buf.msgMap[msg.id] = msg);
      saves.save();
    },
    
    resetMessageOrder: function() {
      var realOrder = [];
      var orderedKeys = {};
      
      // Remove keys that do not exist.
      for (var i = 0, key; key = buf.msgOrder[i]; ++i) {
        if (buf.msgMap[key]) {
          realOrder.push(key);
          orderedKeys[key] = 1;
        }
      }
      
      // Append missed keys.
      for (key in buf.msgMap) {
        if (orderedKeys[key]) {
          continue;
        }
        realOrder.push(key);
      }
      buf.msgOrder = realOrder;
    },
    
    getMessageOrder: function() {
      return buf.msgOrder;
    },
    
    setMessageOrder: function(newOrder) {
      buf.msgOrder = newOrder;
      saves.save();
    },
    
    sortMessage: function(sort) {
      // Making sure every messages be saved.
      self.resetMessageOrder();
      
      var msgArr = [];
      for (var key in buf.msgMap) {
        msgArr.push(buf.msgMap[key]);
      }
      
      msgArr.sort(handlerList.sortMessage[sort]);
      
      var msgOrder = [];
      for (var i = 0, msg; msg = msgArr[i]; ++i) {
        msgOrder.push(msg.id);
      }
      
      self.setMessageOrder(msgOrder);
    }
  };
  
  self.init();
  
  return self;
});