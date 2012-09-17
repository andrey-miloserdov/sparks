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
 * >> create board object with API
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
  var component = function() {
  };
  // parts of more complex components on breadboard(need only for building)
  var primitive = function() {
  };
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

    // multimetr probes
    initializeProbes.call(this);
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
    this.num = (elem.attr("xlink:href") == "#$:hole_connected") ? 1 : 0;
  };

  CircuitBoardHole.prototype.connected = function() {
    this.num++;
    this.view.attr("xlink:href", "#$:hole_connected");
    return this;
  };

  CircuitBoardHole.prototype.disconnected = function() {
    if(--this.num === 0) {
      this.view.attr("xlink:href", "#$:hole_not_connected");
    }
    return this;
  };
  /* === #components begin === */
  component.prototype.init = function(params, holes) {
    var loc = params["connections"].split(',');
    this.pts = [holes[loc[0]], holes[loc[1]]];
    this.angle = getAngleBetwPoints(this.pts);
    this.leads = addLeads(this.pts, getDegsFromRad(this.angle));
    this.view = SVGStorage.create('group').attr({
      'component' : params.type,
      'uid' : params.UID
    });
    this.hole = [this.pts[0].connected(), this.pts[1].connected()];
  };

  component.wire = function(params, holes) {
    component.prototype.init.call(this, params, holes);
    var color = params.color || "rgb(173,1,1)";
    this.wire = new primitive.connector(this.pts, this.angle, [color, color]);
    this.view.append(this.wire.view, this.leads[0].view, this.leads[1].view);
  };

  component.inductor = function(params, holes) {
    component.prototype.init.call(this, params, holes);
    this.connector = new primitive.connector(this.pts, this.angle, ['rgb(108,27,13)', 'rgb(185,77,42)']);
    this.inductor = new primitive.inductor(this.pts, this.angle, params.label);
    this.view.append(this.connector.view, this.leads[0].view, this.leads[1].view, this.inductor.view);
  };

  component.resistor = function(params, holes) {
    component.prototype.init.call(this, params, holes);
    this.connector = new primitive.connector(this.pts, this.angle);
    this.resistor = new primitive.resistor(this.pts, this.angle, params.label, params.color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.resistor.view);
  };

  component.capacitor = function(params, holes) {
    component.prototype.init.call(this, params, holes);
    var color = params.color || "rgb(255,0,0)";
    this.connector = new primitive.connector(this.pts, this.angle);
    this.capacitor = new primitive.capacitor(this.pts, this.angle, params.label, color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.capacitor.view);
  };
  /* === #components end === */
  /* === #primitive begin === */

  primitive.lead = function(type, pos, angle) {
    var lead = SVGStorage.create('lead').clone();
    this.view_d = lead.find('[type="disconnected"]').hide();
    this.view_c = lead.find('[type="connected"]').show();

    // set the right direction
    lead.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + ((type == 'left') ? 1 : -1) + ' 0 0 1 0 0)'
    });

    // set the position
    lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",130,130)");

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

  primitive.connector = function(pts, angle, color) {
    var connector = SVGStorage.create('connector').clone();
    var deg = getDegsFromRad(angle);

    if(deg <= 0 && deg >= -90) {
      connector.attr('transform', 'matrix(1 0 0 1 ' + parseInt(pts[0].x, 10) + ' ' + parseInt(pts[0].y, 10) + ') rotate(' + deg + ',127.5,127.5) translate(0,-5)');
    } else {
      connector.attr('transform', 'matrix(1 0 0 1 ' + parseInt(pts[0].x, 10) + ' ' + parseInt(pts[0].y, 10) + ') rotate(' + deg + ',132.5,132.5)');
    }

    var halfHoleSize = 130, leadLenght = 560;
    var x1 = pts[0].x + halfHoleSize + leadLenght * Math.cos(angle);
    var y1 = pts[0].y + halfHoleSize + leadLenght * Math.sin(angle);
    var x2 = pts[1].x + halfHoleSize - leadLenght * Math.cos(angle);
    var y2 = pts[1].y + halfHoleSize - leadLenght * Math.sin(angle);

    var l = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    connector.find('[type=line]').each(function() {
      $(this).attr('d', 'M 0 0 h ' + l / 0.6);
    });
    if(color !== undefined) {
      connector.find('[type=line]').eq(1).attr('stroke', color[0]);
      connector.find('[type=line]').eq(2).attr('stroke', color[1]);
    }
    this.view = connector;
  };

  primitive.inductor = function(pts, angle, labelText) {
    var inductor = SVGStorage.create('inductor').clone();
    var deg = getDegsFromRad(angle);

    if(deg > 90 || deg < -90) {
      deg += 180;
    }
    inductor.attr('transform', 'matrix(1 0 0 1 ' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + deg + ',132.5,132.5)');

    var label = inductor.find('[type=label]');
    if(!touch) {
      inductor.bind('mouseover', function() {
        label.show();
      });
      inductor.bind('mouseout', function() {
        label.hide();
      });
    } else {
      label.show();
    }
    inductor.find('[type=label_text]').append(labelText);
    this.view = inductor;
  };

  primitive.capacitor = function(pts, angle, labelText, color) {
    var capacitor = SVGStorage.create('capacitor').clone();
    var label = capacitor.find('[type=label]');
    var deg = getDegsFromRad(angle);

    if(angle > 90 || angle < -90) {
      angle += 180;
    }
    capacitor.attr('transform', 'matrix(1 0 0 1 ' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + deg + ',132.5,132.5)');

    if(!touch) {
      capacitor.bind('mouseover', function() {
        label.show();
      });
      capacitor.bind('mouseout', function() {
        label.hide();
      });
    } else {
      label.show();
    }
    capacitor.find('[type=label_text]').append(labelText);
    if(color !== undefined) {
      capacitor.find('[type=cap]').eq(0).attr('fill', color);
    }
    this.view = capacitor;
  };

  primitive.resistor = function(pts, angle, labelText, colors) {
    var resistor = SVGStorage.create('resistor' + colors.length + 'band').clone();
    var tooltip = {};
    var label = resistor.find('[type=label]');
    var band = resistor.find('[type^=band]');
    var deg = getDegsFromRad(angle);

    if(deg > 90 || deg < -90) {
      deg += 180;
    }
    resistor.attr('transform', 'matrix(1 0 0 1 ' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + deg + ',132.5,132.5)');

    band.each(function(i) {
      if(i != (colors.length - 1)) {
        $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
      } else {
        $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
      }
    });
    if(!touch) {
      resistor.bind('mouseover', function() {
        label.show();
      });
      resistor.bind('mouseout', function() {
        label.hide();
      });

      band.each(function(i) {
        tooltip[$(this).attr('type')] = resistor.find('[tooltip=' + $(this).attr('type') + ']').attr('xlink:href', '#:$:resistor-hint-' + colors[i]);

        $(this).bind('mouseover', function() {
          $(this).attr('transform', 'scale(1.6)');
          tooltip[$(this).attr('type')].show();
        });
        $(this).bind('mouseout', function() {
          $(this).attr('transform', 'scale(1)');
          tooltip[$(this).attr('type')].hide();
        });
      });
    } else {
      label.show();
    }

    resistor.find('[type=label_text]').append(labelText);

    this.view = resistor;
  };

  /* === #primitive end === */

  /* === #utils start === */
  var addLeads = function(pts, angle) {
    var leads = ["right", "left"];
    for(var i = 0; i < leads.length; i++) {
      leads[i] = new primitive.lead(leads[i], {
        x : pts[i].x,
        y : pts[i].y
      }, angle);
    }
    return leads;
  };
  var getAngleBetwPoints = function(pts) {
    return Math.atan2((pts[1].y - pts[0].y), (pts[1].x - pts[0].x));
  };
  var getDegsFromRad = function(rad) {
    return (180 / Math.PI) * rad;
  };
  var getCoords = function(evt, area) {
    var offset = area.offset();

    var evt = evt || window.event;
    var posx = 0, posy = 0;

    if ( evt.pageX || evt.pageY ) {
      posx = evt.pageX;
      posy = evt.pageY;
    } else
    if( evt.clientX || evt.clientY ) {
      posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    if ( evt.changedTouches ) {
      posx = evt.changedTouches[0].pageX;
      posy = evt.changedTouches[0].pageY;
    }

    return {
      x : (parseInt( posx ) - offset.left)
        ,
      y : (parseInt( posy ) - offset.top)
    };
  };
  var initializeProbes = function() {
    var self = this, probe, s_pos, c_pos, x, y;
    var holder = this.holder, coeff = 20;
    this.probe = {};

    this.holder.find('[info=probe]').each(function(){
      var elem = $(this), name = elem.attr('name');
      self.probe[ name ] = elem;
      self.probe[ name ].dx = 0;
      self.probe[ name ].dy = 0;

      this.addEventListener( _mousedown, function( evt ) {
        s_pos = getCoords(evt, holder);
        probe = self.probe[ name ];
        evt.stopPropagation();
        evt.preventDefault();
      }, false);
    });

    this.holder[0].addEventListener( _mousemove, function( evt ) {
      if (probe) {
        c_pos = getCoords(evt, holder);
        x = probe.dx + (c_pos.x - s_pos.x) * coeff;
        y = probe.dy + (c_pos.y - s_pos.y) * coeff;
        probe.attr('transform','translate('+x+','+y+')');
      }
    }, false );

    this.holder[0].addEventListener( _mouseup, function( evt ) {
      if (probe) {
        probe.dx = x;
        probe.dy = y;
        probe = null;
      }
    }, false );
  };
  /* === #utils stop === */

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
    SVGStorage = new SVGStorage(paper);
    board.ready = true;
  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };
})(jQuery, window["breadboard"]);
