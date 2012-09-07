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
  var paper = null;

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  var _mousedown = (touch ) ? 'touchstart' : 'mousedown';
  var _mousemove = (touch ) ? 'touchmove' : 'mousemove';
  var _mouseup = (touch ) ? 'touchend' : 'mouseup';
  var _mouseover = (touch ) ? 'xxx' : 'mouseover';
  var _mouseout = (touch ) ? 'xxx' : 'mouseout';

  // object contains components added to breadboard
  var component = {};

  // parts of more complex components on breadboard(need only for building)
  var primitive = {};

  // board constructor
  var CircuitBoard = function(id) {

    var self = this;

    // link to main holder
    this.holder = $('#' + id).html('').append(paper).addClass('circuit-board');

    this.workspace = this.holder.find("[item=components]");
    this.holes = [];
    this.component = {};

    this.holder.find("[hole]").each(function() {
      self.holes[$(this).attr("hole")] = new CircuitBoardHole($(this));
    });
  };

  CircuitBoard.prototype.addComponent = function(elem) {
    this.component[elem["UID"]] = new component[ elem["type"] ](elem, this.holes);
    this.workspace.append(this.component[elem["UID"]].view);
  };

  CircuitBoard.prototype.removeComponent = function(id) {
    this.component[id].hole[0].disconnected();
    this.component[id].hole[1].disconnected();
    this.component[id].view.remove();
    this.component[id] = null;

  };
  // holes constructor
  var CircuitBoardHole = function(elem) {
    this.x = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[4], 10);
    this.y = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[5], 10);
    this.view = elem;
    if(elem.attr("xlink:href") == "#$:hole_connected") {
      this.num = 1;
    } else {
      this.num = 0;
    }
  };

  CircuitBoardHole.prototype.connected = function() {
    this.num++;
    this.view.attr("xlink:href", "#$:hole_connected");
  };

  CircuitBoardHole.prototype.disconnected = function() {
    if(--this.num === 0) {
      this.view.attr("xlink:href", "#$:hole_not_connected");
    }
  };
  /* === #componets begin === */

  component.wire = function(params, holes) {

    var loc = params["connections"].split(',');

    var p1 = holes[loc[0]], p2 = holes[loc[1]];
    var color = params.properties["color"] || "rgb(173,1,1)";
    var angle = (180 / Math.PI) * Math.atan2((p2.y - p1.y), (p2.x - p1.x));

    this.view = SVGStorage.create('group').attr({
      'component' : 'wire',
      'uid' : params['UID']
    });
    this.lead = [];
    this.lead[0] = new primitive.lead('right', {
      x : p1.x,
      y : p1.y
    }, angle);
    this.lead[1] = new primitive.lead('left', {
      x : p2.x,
      y : p2.y
    }, angle);
    this.wire = new primitive.line(p1, p2, angle * (Math.PI / 180), color);

    this.view.append(this.lead[0].view, this.lead[1].view, this.wire.view);

    this.hole = [];
    this.hole[0] = p1;
    this.hole[1] = p2;

    p1.connected();
    p2.connected();

  };

  component.wire.prototype = {
    'move' : null,
    'color' : null
  };

  /* === #componets end === */

  /* === #primitive begin === */

  primitive.line = function(p1, p2, angle, color) {
    var line = SVGStorage.create('line').clone();
    var dl = 120, corr = 600;
    line.attr({
      "x1" : p1.x + dl + corr * Math.cos(angle),
      "y1" : p1.y + dl + corr * Math.sin(angle),
      "x2" : p2.x + dl - corr * Math.cos(angle),
      "y2" : p2.y + dl - corr * Math.sin(angle)
    });
    line.attr("stroke", color);
    this.view = line;
  };

  primitive.lead = function(type, pos, angle) {
    var lead = SVGStorage.create('lead').clone();
    this.view_d = lead.find('[type="disconnected"]').hide();
    this.view_c = lead.find('[type="connected"]').show();

    // set the right direction
    lead.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + ((type == 'left') ? 1 : -1) + ' 0 0 1 0 0)'
    });

    // set the position
    if(type == 'left') {
      lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",100,130)");
    } else {
      lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",130,130)");
    }

    var arrow = lead.find('.arrow').hide();
    // bind hover events
    var action = lead.find("[type=action]");
    if(!touch) {
      action.bind('mouseover', function() {
        arrow.show();
      });
      action.bind('mouseout', function() {
        arrow.hide();
      });
    }

    // bind onclick events
    action[0].addEventListener(_mouseup, function(l) {
      var f = false;
      return function() {
        l[ (f = !f) ? 'disconnect' : 'connect' ]();
      };
    }(this), false);

    this.view = lead;
  };

  primitive.lead.prototype.connect = function() {
    this.view_d.hide();
    this.view_c.show();
  };

  primitive.lead.prototype.disconnect = function() {
    this.view_c.hide();
    this.view_d.show();
  };
  /* === #primitive end === */

  var SVGStorage = function(data) {
    var self = this;

    this.view = {
      'board' : data
    };
    data.find('[primitive]').each(function() {
      var elem = $(this), name = elem.attr('primitive');
      elem.removeAttr('primitive');
      self.view[name] = elem.remove();
    });
  };

  SVGStorage.prototype.create = function(name) {
    return this.view[name].clone();
  };

  board.util.require(["sparks.breadboard.svg"], function(data) {
    paper = $(data["sparks.breadboard"]);

    //constructor is no longer needed
    SVGStorage = new SVGStorage(paper);

    board.ready = true;
  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };
})(jQuery, window["breadboard"]);
