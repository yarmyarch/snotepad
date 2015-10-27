define(function() {
  'use strict';
  var self;

  return self = {
    COLORS: {
      red: 'F00',
      orange: 'F90',
      yellow: 'FF0',
      green: '0F0',
      cyan:'0FF',
      blue: '00F',
      purple: 'F0F',
      white: 'FFF',
      Black: '000',
      random: false
    },
    DATA_KEY: '16F4AAC004AC08A0',
    TITLE: 'sNotePad - by Yujia',
    RAND_ID_PREFIX: 'YZ_',
    HTML: {
      COLOR_SECTION: '<div class="color_box %1%" title="%1%" id="colorSection%2%"></div>',
      MSG_PREVIEW: 
        '<div class="msg_item swiper-container fancy" id="msgItem_%1%">' +
          '<div class="swiper-wrapper">' +
            '<div class="swiper-slide msg_preview" id="msgPreview_%1%">' +
              '<div class="msg_title title" id="msgPrevTitle_%1%" title="%2%">%3%</div>' +
              '<div class="msg_title date" id="msgPrevDate_%1%" title="%4%">%4%</div>' +
              '<div class="msg_pre_content" id="msgPrevCtnt_%1%" title="%5%">%6%</div>' +
            '</div>' +
          '</div>' +
          '<div class="msg_delete" id="msgDelete_%1%">✘</div>' +
        '</div>'
    },
    NAVS: ['navSort', 'navSetting', 'navBack'],
    ORDERS: ['content', 'date', 'title', 'random']
  };
});