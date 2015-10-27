/**
 * Module taking care of the general UI.
 */
define([
    'config', 'lib/util', 'lib/swiper', './senseController', 'components/message/message'],
    function(config, util, SwiperUtil, controller, message) {
  'use strict';
  var self;
  
  var contentSwiper;
  var msgSwipers = {};
  var touchedMsgId;
  // The msg id that's actived for deleting or editing.
  var deletingId;
  var popupId;
  
  // Extra internal handlers.
  var handlerList = {
    setBgColor: {
      // When bgColor set to red, change the color of the 'x' button.
      'F00': function() {
        util.addClassName(document.getElementById('deleteMessage'), 'conflict');
      },
      // When bgColor set to cyan, change the color of the '+' button.
      '0FF': function() {
        util.addClassName(document.getElementById('newMessagePreview'), 'conflict');
      },
      // When bgColor set to cyan, change the color of the '+' button.
      '000': function() {
        util.addClassName(document.getElementById('msgList'), 'black');
      }
    },
    setBgColorNot: {
      'F00': function() {
        util.removeClassName(document.getElementById('deleteMessage'), 'conflict');
      },
      '0FF': function() {
        util.removeClassName(document.getElementById('newMessagePreview'), 'conflict');
      },
      '000': function() {
        util.removeClassName(document.getElementById('msgList'), 'black');
      }
    }
  };
  
  var addMsgSwiper = function(id) {
    var msgId =id.match(/_(\w+)/)[1]; 
    msgSwipers[msgId] = new SwiperUtil(id, {
      slidesOffsetAfter: 48,
      touchRatio: 0.5,
      resistanceRatio: 0,
      
      onTouchStart: function(swiper) {
        if (!swiper.msgId) {
          return;
        }
        touchedMsgId = swiper.msgId;
      },
      
      onTouchEnd: function(swiper) {
        if (!swiper.msgId || !touchedMsgId || deletingId == swiper.msgId) {
          return;
        }
        if (touchedMsgId == swiper.msgId) {
          controller.setCurrentMessage(message.getMessage(swiper.msgId));
          //~ deletingId = false;
          touchedMsgId = false;
          contentSwiper.slideTo(0);
        }
      },
      
      onReachBeginning: function(swiper) {
        if (!swiper.msgId) {
          return;
        }
        if (deletingId == swiper.msgId) {
          var dltBtn = document.getElementById('msgDelete_' + swiper.msgId);
          util.removeClassName(dltBtn, 'active');
          //~ deletingId = false;
          touchedMsgId = false;
        }
      },
      
      onReachEnd: function(swiper) {
        if (!swiper.msgId) {
          return;
        }
        var dltBtn;
        if (deletingId) {
          dltBtn = document.getElementById('msgDelete_' + deletingId);
          msgSwipers[deletingId].slideTo(0);
          util.removeClassName(dltBtn, 'active');
        }
        dltBtn = document.getElementById('msgDelete_' + swiper.msgId);
        util.addClassName(dltBtn, 'active');
        deletingId = swiper.msgId;
      }
    });
    msgSwipers[msgId].msgId = msgId;
    
    util.addEventListener(document.getElementById('msgDelete_' + msgId), 'click', (function() {
      return function() {
        self.removeMessageContent(msgId);
      };
    })(msgId));
  };
  
  var createContentSwiper = function() {
    contentSwiper = new SwiperUtil('.swiper-container.slide', {
      initialSlide: 1,
      resistanceRatio: 0,
      onlyExternal: true,
      
      onReachBeginning: function() {
        if (deletingId && msgSwipers[deletingId]) {
          msgSwipers[deletingId].slideTo(0);
          deletingId = false;
        }
      },
      
      onReachEnd: function() {
        // Initially the content block is invisible to prevent the flash on loading.
        // Set it actived when loaded.
        util.addClassName(document.getElementById('msgContentWrap'), 'active');
      },
      
      onSlideChangeStart: function(swiper) {
        if (swiper.activeIndex) {
          self.leaveEditMode(controller.getCurrentMessage());
          swiper.params.onlyExternal = true;
        } else {
          self.setEditMode(controller.getCurrentMessage());
          swiper.params.onlyExternal = false;
        }
      }
    });
  };
  
  self = {
    /**
     * Might be called multiple times when new data saved from other pages.
     */
    setSense: function() {
      createContentSwiper();
      
      self.resetTitle();
      self.setBgColor(controller.getBgColor());
    },
    
    clearSense: function() {
      controller.setCurrentMessage();
      
      var msgMap = message.getAllMessages();
      var msgElem;
      for (var i in msgMap) {
        msgElem = document.getElementById('msgItem_' + i);
        msgElem && msgElem.parentNode.removeChild(msgElem);
      }
      
      document.getElementById('headerTitleEdit').value = '';
      document.getElementById('msgContent').value = '';
      contentSwiper.slideTo(1);
      deletingId = false;
      touchedMsgId = false;
      msgSwipers = {};
    },
    
    bindPublicEvents: function() {
      // Add new message
      util.addEventListener(document.getElementById('newMessage'), 'click', function() {
        // clear current message record.
        controller.setCurrentMessage();
        contentSwiper.slideTo(0);
      });
      
      // Save message
      util.addEventListener(document.getElementById('saveMessage'), 'click', function() {
        // Nothing else to do.
        contentSwiper.slideTo(1);
      });
      
      util.addEventListener(document.getElementById('navBack'), 'click', function() {
        contentSwiper.slideTo(1);
      });
      
      // Delete message
      util.addEventListener(document.getElementById('deleteMessage'), 'click', function() {
        var currentMessage = controller.getCurrentMessage();
        self.removeMessageContent(currentMessage && currentMessage.id);
        controller.setCurrentMessage();
        
        // Clear input area so it won't be added as a new message.
        document.getElementById('headerTitleEdit').value = '';
        document.getElementById('msgContent').value = '';
        
        contentSwiper.slideTo(1);
      });
      
      // Enter or tab key in title input leads to the content input.
      util.addEventListener(document.getElementById('headerTitleEdit'), 'keydown', function(event) {
        if (+event.keyCode == 13 || +event.keyCode == 9) {
          event.preventDefault();
          document.getElementById('msgContent').focus();
        }
      });
      
      // Save before close.
      util.addEventListener(window, 'beforeunload', function() {
        // Save blank message to trigger saving function.
        message.saveMessage();
      });
      util.addEventListener(window, 'unload', function() {
        message.saveMessage();
      });
      
      // nav actions.
      var navElem, activedNavId;
      // Hide nav on other clicks.
      var hideActivedNav = function() {
        if (activedNavId) {
          util.removeClassName(document.getElementById(activedNavId).parentNode, 'active');
          activedNavId = false;
        }
      };
      var createClickHandler = function(navId) {
        return function(event) {
          var navElem = document.getElementById(navId);
          util.addClassName(navElem.parentNode, 'active');
          hideActivedNav();
          event.preventDefault();
          event.cancelBubble = true;
          event.stopPropagation();
          activedNavId = navId;
        };
      };
      
      for (var i = 0, navId; navId = config.NAVS[i]; ++i) {
        navElem = document.getElementById(navId);
        util.addEventListener(navElem, 'click', createClickHandler(navId));
      }
      util.addEventListener(document.body, 'click', hideActivedNav);
      
      // Color selection
      util.addEventListener(document.getElementById('popupColor'), 'click', self.hidePopup);
      
      util.addEventListener(document.getElementById('navSetColor'), 'click', function(){
        self.showPopup(document.getElementById('popupColor'));
      });
      
      // Sort functions.
      createClickHandler = function(id) {
        return function() {
          message.sortMessage(id);
          self.clearSense();
          self.setSense();
          self.renderLoadedMsgs();
        };
      };
      var sortId;
      for (i = 0; sortId = config.ORDERS[i]; ++i) {
        util.addEventListener(document.getElementById(
            'sortBtn' + util.getFUStr(sortId)), 'click', createClickHandler(sortId));
      }
      
      // resize.
      util.addEventListener(window, 'resize', self.resizeSwipers);
      
      // About button
      util.addEventListener(document.getElementById('navAbout'), 'click', function() {
        alert('God shows his love for us.\r\n This is Yujia(yarmyarch@live.cn or yujia@google.com). \r\n No rights reserved. Free to copy.');
      });
    },
    
    addNewMessage: function(title, content) {
      title = title.trim();
      content = content.trim();
      if (!title && !content) {
        return;
      }

      var date = new Date();
      var newMsg = message.createMessage();
      newMsg.title = title;
      newMsg.date = +date;
      newMsg.content = content;
      controller.setCurrentMessage(newMsg);
      message.saveMessage(newMsg);
      self.addMsgHtml(newMsg);
      setTimeout(function() {
        self.resizeSwipers();
      });
    },
    
    addMsgHtml: function(msg) {
      var date = new Date(msg.date);
      var msgHtml = util.buildHtml(
          config.HTML.MSG_PREVIEW,
          msg.id,
          msg.title || '',
          msg.title || '<i>Empty</i>',
          message.formatMessageDate(date),
          msg.content || '',
          msg.content || '<i>Empty</i>');
      var msgElem = document.createElement('div');
      msgElem.innerHTML = msgHtml;
      document.getElementById('msgList').insertBefore(
          msgElem.childNodes[0],
          document.getElementById('newMessage'));
      
      addMsgSwiper('#msgItem_' + msg.id);
      setTimeout((function(key) {
        return function() {
          util.removeClassName(document.getElementById('msgItem_' + key), 'fancy');
        };
      })(msg.id));
    },
    
    updateMessage: function(id, title, content) {
      var date = new Date();
      var msg = controller.getCurrentMessage();
      msg.title = title;
      msg.date = +date;
      msg.content = content;
      controller.setCurrentMessage(msg);
      message.saveMessage(msg);
      
      var titleElem = document.getElementById('msgPrevTitle_' + msg.id);
      var dateElem = document.getElementById('msgPrevDate_' + msg.id);
      var contentElem = document.getElementById('msgPrevCtnt_' + msg.id);
      var time = message.formatMessageDate(date);
      
      titleElem.title = title;
      titleElem.innerHTML = title || '<i>Empty</i>';
      dateElem.title = time;
      dateElem.innerHTML = time;
      contentElem.title = content;
      contentElem.innerHTML = content || '<i>Empty</i>';
    },
    
    setEditMode: function(msg) {
      var titleInput = document.getElementById('headerTitleEdit');
      var ctntInput = document.getElementById('msgContent');
      titleInput.value = msg && msg.title || '';
      ctntInput.value = msg && msg.content || '';
      
      util.addClassName(document.getElementById('headerTitle'), 'hidden');
      if (!msg || !msg.title) {
        titleInput.focus();
      } else {
        ctntInput.focus();
      }
      self.navStatusChange(0);
    },
    
    leaveEditMode: function(msg) {
      if (msg && msg.id) {
        self.updateMessage(
          msg.id,
          document.getElementById('headerTitleEdit').value.trim(),
          document.getElementById('msgContent').value.trim()
        );
      } else {
        self.addNewMessage(
          document.getElementById('headerTitleEdit').value.trim(),
          document.getElementById('msgContent').value.trim()
        );
      }
      self.resetTitle();
      self.navStatusChange(1);
    },
    
    removeMessageContent: function(msgId) {
      if (!msgId) {
        return;
      }
      message.deleteMessage(msgId);
      var msgItem = document.getElementById('msgItem_' + msgId);
      util.addClassName(msgItem, 'fancy');
      setTimeout(function() {
        msgItem.parentNode.removeChild(msgItem);
        setTimeout(function() {
          // Resize all swipers.
          self.resizeSwipers();
        });
      }, 200);
      msgSwipers[msgId].destroy();
      msgSwipers[msgId] = null;
    },
    
    resetTitle: function() {
      var titleWrap = document.getElementById('headerTitle');
      util.removeClassName(document.getElementById('headerTitle'), 'hidden');
      document.getElementById('headerTitleEdit').value = ' ';
      titleWrap.innerHTML = config.TITLE;
      util.removeClassName(document.getElementById('navSort').parentNode, 'hidden');
      util.addClassName(document.getElementById('navBack').parentNode, 'hidden');
    },
    
    resizeSwipers: function() {
      for (var i in msgSwipers) {
        msgSwipers[i] && msgSwipers[i].updateSlidesSize();
      }
    },
    
    renderLoadedMsgs: function() {
      var msgMap = message.getAllMessages();
      var msgOrder = message.getMessageOrder();
      
      var createTimeoutHandler = function(key, index) {
        setTimeout(function() {
          self.addMsgHtml(msgMap[key]);
        }, 200 * Math.sqrt(index));
      };
      
      for (var i = 0, key; key = msgOrder[i]; ++i) {
        createTimeoutHandler(key, i);
      }
    },
    
    renderColorSection: function() {
      var colorSectionHtml = [];
      var createClickHandler = function(colorCode) {
        return function() {
          var bgColor = colorCode || util.rgbToHex(
              Math.random(), Math.random(), Math.random());
          self.hidePopup();
          self.setBgColor(bgColor);
          controller.setBgColor(bgColor);
        };
      };
      for (var i in config.COLORS) {
        colorSectionHtml.push(util.buildHtml(config.HTML.COLOR_SECTION, i, util.getFUStr(i)));
      }
      document.getElementById('colorWrap').innerHTML = colorSectionHtml.join('');
      // Random content
      document.getElementById('colorSectionRandom').innerHTML = '?';
      for (i in config.COLORS) {
        util.addEventListener(
            document.getElementById('colorSection' + util.getFUStr(i)),
            'click',
            createClickHandler(config.COLORS[i]));
      }
    },
    
    showPopup: function(popElem) {
      util.addClassName(popElem, 'active');
      // All showing popup should have an id.
      popupId = popElem.id;
    },
    
    hidePopup: function() {
      if (!popupId) {
        return;
      }
      util.removeClassName(document.getElementById(popupId), 'active');
    },
    
    /**
     * Changes nav buttons when switching between content and message list.
     * @param index Tab index. Would be 0 when it's the edit page.
     */
    navStatusChange: function(index) {
      var navBack = document.getElementById('navBack');
      var navSort = document.getElementById('navSort');
      var actived = index ? navSort.parentNode : navBack.parentNode;
      var inactived = index ? navBack.parentNode : navSort.parentNode;
      
      util.addClassName(inactived, 'hidden');
      util.removeClassName(actived, 'hidden');
    },
    
    setBgColor: function(colorCode){
      if (!colorCode) {
        return;
      }
      
      // In case of some special colors.
      handlerList['setBgColor'][colorCode] && handlerList['setBgColor'][colorCode]();
      for (var i in handlerList['setBgColorNot'][colorCode]) {
        if (i != colorCode) {
          handlerList['setBgColorNot'][colorCode]();
        }
      }
      
      var mainWrap = document.getElementById('mainWrap');
      mainWrap.style.backgroundColor = '#' + colorCode.replace(/\W+/, '');
      // If it's not dark enough, change the font color to white.
      mainWrap.style.color = util.isColorTooLight(colorCode, 0.5) ? '#000' : '#FFF';
    }
  };
  
  return self;
});