/**
 * @author Mobile.Lab (http://mlearner.com)
 **/

window["breadboard"] = {
  "options" : {
    "rootpath" : ""
  },
  "util" : {}
};

/**
 * breadboard # util # require
 * >> loading required resources
 **/

(function($, board) {

  board.util.require = function(files, callback) {
    return new LoadingStack(files, callback).load();
  };
  var LoadingStack = function(files, callback) {
    this.callback = callback;
    // callback function
    this.resources = {};
    // downloaded resources
    this.stack = files;
    // main stack of loading files
    this.loaded = 0;
    // counter of loaded files
  };

  LoadingStack.prototype.success = function() {
    if(++this.loaded == this.stack.length) {
      this.callback(this.resources);
    }
  };

  LoadingStack.prototype.attachData = function(file, data) {
    file = file.substring(file.lastIndexOf('\/') + 1, file.lastIndexOf('.'));
    this.resources[file] = data;
  };

  LoadingStack.prototype.load = function() {
    var f;
    for(var i = this.stack.length; i--; ) {
      f = this.stack[i];
      this["load" + f.toUpperCase().substring( f.lastIndexOf('.') + 1 )](f);
    }
  };

  LoadingStack.prototype.loadJS = function(file) {
    file = board.options.rootpath + file;

    $.getScript(file, function(stack) {
      return function() {
        stack.success();
      };
    }(this)).fail(function() {
      console.log("# [error] (while requiring) failed load/compile javascript file: " + file);
    });
  };

  LoadingStack.prototype.loadCSS = function(file) {
    file = board.options.rootpath + file;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = file;
    document.head.appendChild(link);

    this.success();
  };

  LoadingStack.prototype.loadSVG = function(file) {
    this.loadResource(file);
  };

  LoadingStack.prototype.loadResource = function(file) {
    file = board.options.rootpath + file;

    $.ajax({
      "url" : file,
      "type" : "GET",
      "dataType" : "html",
      "success" : function(stack) {
        return function(data) {
          stack.attachData(file, data);
          stack.success();
        };
      }(this),
      "error" : function() {
        console.log("# [error] (while requiring) failed load resource file: " + file);
      }
    });
  };
})(jQuery, window["breadboard"]);

/**
 * breadboard # board
 * >> create board object with api
 **/

(function($, board) {

  // global link to common SVG-jQuery object
  var widget = null;
  var paper = null;

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  var _mousedown = (touch ) ? 'touchstart' : 'mousedown';
  var _mousemove = (touch ) ? 'touchmove' : 'mousemove';
  var _mouseup = (touch ) ? 'touchend' : 'mouseup';
  var _mouseover = (touch ) ? 'xxx' : 'mouseover';
  var _mouseout = (touch ) ? 'xxx' : 'mouseout';

  // board constructor

  var CircuitBoard = function(id) {
    // link to main holder
    this.holder = $('#' + id).html('').append(paper).addClass('circuit-board');
    this.inner = {};

    var inner = this.inner;
    inner.workspace = $("[item=components]");
    inner.lead = inner.workspace.find("[component=lead]");
    inner.line = inner.workspace.find("[component=line]");
    inner.holes = [];

    this.holder.find("[hole]").each(function() {
      inner.holes[$(this).attr("hole")] = new CircuitBoardHole($(this));
    });
  };

  CircuitBoard.prototype.addComponent = function(component) {
    var type = component["type"].charAt(0).toUpperCase() + component["type"].substring(1);

    this["add" + type](component);
  };

  CircuitBoard.prototype.addWire = function(params) {
    var loc = params["connections"].split(',');

    var p1 = this.inner.holes[loc[0]], p2 = this.inner.holes[loc[1]];

    var leadLeft = new CircuitBoardLead(this.holder, 'left', {
      x : p2.x,
      y : p2.y
    });
    var leadRight = new CircuitBoardLead(this.holder, 'right', {
      x : p1.x,
      y : p1.y
    });

    var angle = (180 / Math.PI) * Math.atan2((p2.y - p1.y), (p2.x - p1.x));

    leadRight.attr("transform", "matrix(1 0 0 1 " + p1.x + " " + p1.y + ") rotate(" + (180 + angle) + ",130,130)");
    this.inner.workspace.append(leadRight);

    leadLeft.attr("transform", "matrix(1 0 0 1 " + p2.x + " " + p2.y + ") rotate(" + (180 + angle) + ",100,130)");
    this.inner.workspace.append(leadLeft);

    var dl = 120, corr = 600;
    angle = angle * (Math.PI / 180);
    var line = this.inner.line.clone();
    line.attr({
      "x1" : p1.x + dl + corr * Math.cos(angle),
      "y1" : p1.y + dl + corr * Math.sin(angle),
      "x2" : p2.x + dl - corr * Math.cos(angle),
      "y2" : p2.y + dl - corr * Math.sin(angle)
    });
    line.attr("stroke", "rgb(173,1,1)");
    this.inner.workspace.append(line);

    p1.connected();
    p2.connected();
  };

  CircuitBoard.prototype.addResistor = function(params) {

  };
  var CircuitBoardHole = function(elem) {
    this.x = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[4], 10);
    this.y = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[5], 10);
    this.view = elem;
  };

  CircuitBoardHole.prototype.connected = function() {
    this.view.attr("xlink:href", "#$:hole_connected");
  };

  CircuitBoardHole.prototype.disconnected = function() {
    this.view.attr("xlink:href", "#$:hole_not_connected");
  };
  var CircuitBoardLead = function(elem, type, pos) {
    this.view = elem.find('defs[info="patterns"] > [id="$:#:lead"]').clone();
    this.view_d = this.view.find('[type="disconnected"]').hide();
    this.view_c = this.view.find('[type="connected"]').show();

    // set the right direction
    this.view.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + ((type == 'left') ? 1 : -1) + ' 0 0 1 0 0)'
    });

    // set the position
    this.view.attr({
      "transform" : 'matrix(1 0 0 1 ' + pos.x + ' ' + pos.y + ')'
    });

    // bind hover events
    if(!touch) {
      var arrow = this.view.find('.arrow').hide();
      this.view.bind('mouseover', function() {
        arrow.show();
      });
      this.view.bind('mouseout', function() {
        arrow.hide();
      });
    }

    // bind onclick events
    this.view[0].addEventListener(_mouseup, function(lead) {
      var f = false;
      return function() {
        lead[ (f = !f) ? 'disconnect' : 'connect' ]();
      };
    }(this), false);

    return this.view;
  };

  CircuitBoardLead.prototype.connect = function(elem) {
    this.view_d.hide();
    this.view_c.show();
  };

  CircuitBoardLead.prototype.disconnect = function(elem) {
    this.view_c.hide();
    this.view_d.show();
  };
  /*SVGController.prototype.create = function( name ) {
   return this.element[ name ].clone().removeAttr('id');
   };*/

  /*var create_svg_element = function() {
   var element = {};
   this.paper.find('g[id^="$:#:"]').each(function() {
   var elem = $(this), name = elem.attr('id').replace(/\$:#:/g, '');
   element[ name ] = elem;
   })
   };*/

  /*var build_view = function( id ) {
   if ( (navigator.vendor + '').toLowerCase().indexOf('apple') > -1 ) {
   return $('#'+ id).each(function() {
   this.innerHTML = paper;
   }).addClass('circuit-board');
   } else {
   return $('#'+ id).html(  paper ).addClass('circuit-board');
   }
   };*/

  board.util.require(["sparks.breadboard.svg"], function(data) {
    //widget = new SVGController( data["sparks.breadboard"] );
    paper = $(data["sparks.breadboard"]);
    board.ready = true;
  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };
})(jQuery, window["breadboard"]);
