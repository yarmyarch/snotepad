/**
 * Well, you know it.
 * @author yarmyarch@live.cn
 * @see https://github.com/yarmyarch/Cross-Page-communication
 * @see https://github.com/yarmyarch/Aop-in-js
 * @see https://github.com/ftlabs/fastclick
 * @see https://github.com/nolimits4web/Swiper/
 */
define([
    'lib/fastclick', 'components/saves/saves', 'components/sense/sense', 'components/multipage/multiPage'],
    function(fastclick, saves, sense) {
  'use strict';
  var self;

  return self = {
    init: function() {
      saves.load();
      sense.setSense();
      sense.renderColorSection();
      sense.renderLoadedMsgs();
      sense.bindPublicEvents();
      fastclick.attach(document.body);
    }
  };
});

/*
TODO:
  multi-message selection;
  clear messages;
  opacity selection;
  manual sort;
  Chinese support / Internationalization;
  front sense color change;
  multipageUtil sometimes leak messages;
*/