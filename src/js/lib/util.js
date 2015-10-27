/**
 * Providing util functions.
 */
define(function(){
  'use strict';
  var self;
  
  var LC = {
    MAP_EN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),
    MAP_DE: {}
  };
  
  var buf = {
    riList: {0: 1}
  };
  
  // initialize map for base64.
  for(var i=0; i<64; i++) {
    LC.MAP_DE[LC.MAP_EN[i]] = i;
  }
  
  return self = {
    isExecutable: function(target) {
      return target instanceof Function && (typeof(target)).toLowerCase() == 'function';
    },
    
    getRandom: function(arr) {
      return arr[~~(Math.random() * arr.length)];
    },
    
    popRandom: function(arr) {
      var randomIndex = ~~(Math.random() * arr.length),
        inst = arr[randomIndex];
      
      arr[randomIndex] = arr[arr.length - 1];
      arr.length -= 1;
      return inst;
    },
    
    getRandId: function() {
      var ri = 0,
        _buf = buf;
      while (_buf.riList[ri]) {
        ri = (+(Math.random() + '').substring(2,10)).toString(36);
      }
      buf[ri] = 1;
      return ri;
    },
    
    /**
     * return the a string whose first letter is in uppercase.
     */
    getFUStr: function(str) {
      return str[0].toUpperCase() + str.substr(1);
    },
        
    /**
     * get the function of the target line:
     * y = kx + c,
     * let's say the original line constructed by a and b is 
     * y = -1/k * x + d,
     * while -1/k = (b.y - a.y) / (b.x - a.x).
     *@param a {Point} start position.
     *@param b {Point} ending position.
     */
    getBesierMidPos: function(a, b) {
      var midPos = {x: (b.x + a.x) / 2, y: (b.y + a.y) / 2},
        //~ k = (a.x - b.x) / (b.y - a.y),
        //~ c = midPos.y - k * midPos.x,
        halfDist = Math.sqrt(Math.pow(a.y - b.y, 2) + Math.pow(a.x - b.x, 2)) / 2;
      
      // The line found, let's get a rand position from the line.
      // Don't be too far away from the midPos. 
      // The max distance should be less than half of the distance between a and b.
      
      return {x: midPos.x + Math.round(Math.random(halfDist * 2) - halfDist), y: midPos.y};
    },
    
    base64Encode: function(data) {
      var buf = [],
        map = LC.MAP_EN,
        n = data.length,
        val,
        i = 0;

      while(i < n) {
        val = (data[ i ] << 16) |
          (data[i+1] << 8) |
          (data[i+2]);
        
        buf.push(map[val>>18],
          map[val>>12 & 63],
          map[val>>6 & 63],
          map[val & 63]);
        i += 3;
      }

      if(n%3 == 1) {
        buf.pop();
        buf.pop();
        buf.push('=', '=');
      } else {
        buf.pop();
        buf.push('=');
      }

      return buf.join('');
    },

    base64Decode: function(str) {
      var buf = [],
        arr = str.split(''),
        map = LC.MAP_DE,
        n = arr.length,
        val,
        i=0;

      if(n % 4) {
        return false;
      }

      while(i < n) {
        val = (map[arr[ i ]] << 18) |
          (map[arr[i+1]] << 12) |
          (map[arr[i+2]] << 6)  |
          (map[arr[i+3]]);

        buf.push(val>>16, val>>8 & 0xFF, val & 0xFF);
        i += 4;
      }

      while(arr[--n] == '=') {
        buf.pop();
      }

      return buf;
    },
    
    buildHtml: function(str) {
      var replacements = [].slice.apply(arguments);
      replacements.shift();
      // index starts from 1 in str.
      var buf = {};
      var index = 0;
      return str.replace(/%(\d+)%/g, function(match) {
        if (buf[match]) {
          return buf[match];
        }
        return buf[match] = replacements[index++];
      });
    },
    
    addClassName: function(elem, className) {
      var oriClassName = self.removeClassName(elem, className);
      elem.className = oriClassName + ' ' + className.trim();
    },
    
    removeClassName: function(elem, className) {
      var oriClassName = elem.className;
      return elem.className = oriClassName.replace(new RegExp('(^' + className + '\\s+|\\s+' + className + '|^' + className + '$)', 'g'), '').trim();
    },
    
    hslToRgb: function(hue, saturation, lum) {
	
      var red, green, blue;
      if (lum === 0.0)	{
        red = 0;
        green = 0;
        blue = 0;
      } else {
        var i = Math.floor(hue * 6);
        var f = (hue * 6) - i;
        var p = lum * (1 - saturation);
        var q = lum * (1 - (saturation * f));
        var t = lum * (1 - (saturation * (1 - f)));
        switch (i) {
          case 1 : red = q; green = lum; blue = p; break;
          case 2 : red = p; green = lum; blue = t; break;
          case 3 : red = p; green = q; blue = lum; break;
          case 4 : red = t; green = p; blue = lum; break;
          case 5 : red = lum; green = p; blue = q; break;
          case 6 : // fall through
          case 0 : red = lum; green = t; blue = p; break;
        }
      }
      return {r : red, g : green, b : blue};
    },

    rgbToHsl: function (red, green, blue) {
      
      var max = Math.max(Math.max(red, green), blue);
      var min = Math.min(Math.min(red, green), blue);
      var hue;
      var saturation;
      var lum = max;
      if (min == max) {
        hue = 0;
        saturation = 0;
      } else {
        var delta = (max - min);
        saturation = delta / max;
        if (red == max) {
          hue = (green - blue) / delta;
        }
        else if (green == max) {
          hue = 2 + ((blue - red) / delta);
        } else {
          hue = 4 + ((red - green) / delta);
        }
        hue /= 6;
        if (hue < 0) {
          hue += 1;
        }
        if (hue > 1) {
          hue -= 1;
        }
      }
      return {h : hue, s : saturation, l : lum};
    },

    rgbToHex: function (r, g, b, includeHash) {
      
      r = Math.round(r * 255);
      g = Math.round(g * 255);
      b = Math.round(b * 255);
      if (includeHash === undefined) {
        includeHash = true;
      }
      
      r = r.toString(16);
      if (r.length == 1) {
        r = '0' + r;
      }
      g = g.toString(16);
      if (g.length == 1) {
        g = '0' + g;
      }
      b = b.toString(16);
      if (b.length == 1) {
        b = '0' + b;
      }
      return ((includeHash ? '#' : '') + r + g + b).toUpperCase();
    },
    
    hexToRgb: function(hex_string, default_) {
	
      if (default_ === undefined) {
        default_ = null;
      }
      
      if (hex_string.substr(0, 1) == '#') {
        hex_string = hex_string.substr(1);
      }
      
      var r;
      var g;
      var b;
      if (hex_string.length == 3) {
        r = hex_string.substr(0, 1);
        r += r;
        g = hex_string.substr(1, 1);
        g += g;
        b = hex_string.substr(2, 1);
        b += b;
      }
      else if (hex_string.length == 6) {
        r = hex_string.substr(0, 2);
        g = hex_string.substr(2, 2);
        b = hex_string.substr(4, 2);
      } else {
        return default_;
      }
      
      r = parseInt(r, 16);
      g = parseInt(g, 16);
      b = parseInt(b, 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return default_;
      } else {
        return {r : r / 255, g : g / 255, b : b / 255};
      }
    },
    
    isColorTooLight: function(colorCode, threshold) {
      var rgb = self.hexToRgb(colorCode);
      var hsl = self.rgbToHsl(rgb.r, rgb.g, rgb.b);
      return 1 - hsl.l + hsl.s < (threshold || 0.3);
    },
    
    addEventListener: function(elem, eventName, callback) {
      elem.addEventListener &&
          (elem.addEventListener(eventName, callback), 1) ||
          elem.attachEvent('on' + eventName, callback);
    }
  };
});