var loading = setInterval(function() {
  if (breadboard.ready) {
    clearInterval(loading);
    start_test();
  }
}, 100);
var start_test = function() {

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  describe("On the breadboard", function() {
    var circuit = breadboard.create("container");
    createFakeModel();
    //common functions
    var checkCreateComponent = function(id) {
      it("appeared in DOM", function() {
        expect($("#container").find("[uid=" + id + "]").length).toEqual(1);
      });
      it("rendered", function() {
        expect($("#container").find("[uid=" + id + "]")[0]['getBBox']).toBeDefined();
      });
    };
    var checkRemoveComponent = function(id) {
      it("was removed", function() {
        circuit.removeComponent(id);
        expect(circuit.component[id]).toBeNull();
      });
      it("disappeared from DOM", function() {
        expect($("#container").find("[uid=" + id + "]").length).toEqual(0);
      });
    };

    var checkBBox = function(bbox, arr) {// arr = h,w,x,y
      var str = ["height", "width", "x", "y"];
      for (var i = 0; i < arr.length; i++) {
        expect(parseInt(bbox[str[i]], 10)).toEqual(arr[i]);
      }
    };
    //tests start
    describe("wire and leads", function() {
      var id = "uid1";
      it("was created", function() {
        circuit.addComponent({
          "type" : "wire",
          "UID" : id,
          "connections" : "f13,a3",
          "color" : "rgb(173,1,1)",
          "draggable" : true
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("wire placed in correct position", function() {
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 6084]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(550);
        expect(parseInt(ctm.f, 10)).toEqual(239);
      });

      it("lead0 placed in correct position", function() {
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);
      });

      it("lead1 placed in correct position", function() {
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);
      });

      // we can't generate touch events
      if (!touch) {
        it("arrow showed, if mouse over lead0", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(1);
          o.find("circle").simulate("mouseover");
          expect(o.find(".arrow")[0].style.display).not.toEqual("none");
        });

        it("arrow not visible, if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(1);
          o.find("circle").simulate("mouseout");
          expect(o.find(".arrow")[0].style.display).toEqual("none");
        });

        it("arrow showed, if mouse over lead1", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(2);
          o.find("circle").simulate("mouseover");
          expect(o.find(".arrow")[0].style.display).not.toEqual("none");
        });

        it("arrow not visible, if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(2);
          o.find("circle").simulate("mouseout");
          expect(o.find(".arrow")[0].style.display).toEqual("none");
        });

        it("lead0 disconnected and sent one event(connectionBroken)", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(1);
          var c = breadboard.eventStatus.counter;
          o.find("circle").simulate("mousedown").simulate("mouseup");
          checkBBox(o[0].getBBox(), [814, 778, -498, -294]);
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionBroken");
          expect(breadboard.eventStatus.eventData).toEqual("uid1|f13");
        });

        it("lead0 connected and sent one event(connectionMade)", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(1);
          var c = breadboard.eventStatus.counter;
          o.find("circle").simulate("mousedown").simulate("mouseup");
          checkBBox(o[0].getBBox(), [720, 774, -494, -200]);
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionMade");
          expect(breadboard.eventStatus.eventData).toEqual("uid1|f13");
        });

        it("lead1 disconnected and sent one event(connectionBroken)", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(2);
          var c = breadboard.eventStatus.counter;
          o.find("circle").simulate("mouseup");
          checkBBox(o[0].getBBox(), [814, 778, -20, -294]);
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionBroken");
          expect(breadboard.eventStatus.eventData).toEqual("uid1|a3");
        });

        it("lead1 connected and sent one event(connectionMade)", function() {
          var o = $("#container").find("[uid=" + id + "]>g").eq(2);
          var c = breadboard.eventStatus.counter;
          o.find("circle").simulate("mouseup");
          checkBBox(o[0].getBBox(), [720, 774, -20, -200]);
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionMade");
          expect(breadboard.eventStatus.eventData).toEqual("uid1|a3");
        });
      }

      checkRemoveComponent(id);
    });

    describe("diagonal wire", function() {
      var id = "uid2";

      it("was created", function() {
        circuit.addComponent({
          "type" : "wire",
          "UID" : id,
          "connections" : "j30,a1",
          "color" : "rgb(173,1,1)"
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 18810]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(580);
        expect(parseInt(ctm.f, 10)).toEqual(235);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);

      });
      checkRemoveComponent(id);
    });

    describe("inductor", function() {
      var id = "uid3";
      it("was created", function() {
        circuit.addComponent({
          "type" : "inductor",
          "UID" : id,
          "connections" : "b23,j2",
          "label" : "I1"
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 13603]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(564);
        expect(parseInt(ctm.f, 10)).toEqual(393);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);

        //toContain different rendering in Chrome, IE, Firefox and Safari so multiple values
        //inductor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        expect([648, 622]).toContain(parseInt(bbox.height, 10));
        expect([1118, 1116, 995]).toContain(parseInt(bbox.width, 10));
        expect([-409, -408]).toContain(parseInt(bbox.x, 10));
        expect([-209, -196]).toContain(parseInt(bbox.y, 10));
        $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseout");
      });

      // we can't generate touch events
      if (!touch) {
        it("label showed if mouse over it", function() {
          $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseover");
          var bbox = $("#container").find("[uid=" + id + "]>g").find("[type=label]")[0].getBBox();
          checkBBox(bbox, [719, 919, -193, -75]);
        });

        it("label dissapeared if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseout");
          expect(o[0].style.display).toEqual("none");
        });
      }
      checkRemoveComponent(id);
    });

    describe("resistor (4 band)", function() {
      var id = "uid4";

      it("was created", function() {
        circuit.addComponent({
          "type" : "resistor",
          "UID" : id,
          "connections" : "h30,j1",
          "label" : "R5",
          "color" : ['black', 'green', 'red', 'blue']
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 17524]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(578);
        expect(parseInt(ctm.f, 10)).toEqual(401);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);

        //lead_1 test
        bbox = $("#container").find("[uid=" +id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);

        //resistor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3).find('>g>g').eq(0)[0].getBBox();
        checkBBox(bbox, [64, 190, -94, -32]);

      });

      // we can't generate touch events
      if (!touch) {
        it("label showed if mouse over it", function() {
          $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseover");
          var bbox = $("#container").find("[uid=" + id + "]>g").find("[type=label]")[0].getBBox();
          checkBBox(bbox, [5522, 6964, -14, -12]);
        });

        it("label dissapeared if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseout");
          expect(o[0].style.display).toEqual("none");
        });
      }
      checkRemoveComponent(id);
    });

    describe("resistor (5 band)", function() {
      var id = "uid5";

      it("was created", function() {
        circuit.addComponent({
          "type" : "resistor",
          "UID" : id,
          "connections" : "f8,f23",
          "label" : "R2",
          "color" : ['violet', 'gold', 'blue', 'white', 'yellow']
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 8133]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(271);
        expect(parseInt(ctm.f, 10)).toEqual(331);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);

        //resistor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        checkBBox(bbox, [576, 1710, -846, -138]);

      });

      // we can't generate touch events
      if (!touch) {
        it("label showed if mouse over it", function() {
          $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseover");
          var bbox = $("#container").find("[uid=" + id + "]>g").find("[type=label]")[0].getBBox();
          checkBBox(bbox, [24, 28, -14, -12]);
        });

        it("label dissapeared if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseout");
          expect(o[0].style.display).toEqual("none");
        });
      }
      checkRemoveComponent(id);
    });
    describe("capacitor", function() {
      var id = "uid6";

      it("was created", function() {
        circuit.addComponent({
          "type" : "capacitor",
          "UID" : id,
          "connections" : "e30,e10",
          "label" : "C1"
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getBBox();
        checkBBox(bbox, [0, 11466]);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(434);
        expect(parseInt(ctm.f, 10)).toEqual(299);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        checkBBox(bbox, [720, 774, -494, -200]);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        checkBBox(bbox, [720, 774, -20, -200]);

        //toContain different rendering in Chrome, IE, Firefox and Safari so multiple values
        //capacitor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        expect([632, 628]).toContain(parseInt(bbox.height, 10));
        expect([631, 629]).toContain(parseInt(bbox.width, 10));
        expect([-174, -173]).toContain(parseInt(bbox.x, 10));
        expect([-221, -218]).toContain(parseInt(bbox.y, 10));

      });

      // we can't generate touch events
      if (!touch) {
        it("label showed if mouse over it", function() {
          $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseover");
          var bbox = $("#container").find("[uid=" + id + "]>g").find("[type=label]")[0].getBBox();
          expect([18, 17, 16]).toContain(parseInt(bbox.height, 10));
          expect([17, 18, 19, 20, 21]).toContain(parseInt(bbox.width, 10));
          expect([-10, -11]).toContain(parseInt(bbox.x, 10));
          expect([-8, -9, -7]).toContain(parseInt(bbox.y, 10));
        });

        it("label dissapeared if mouse out", function() {
          var o = $("#container").find("[uid=" + id + "]>g").find("[type=label]").simulate("mouseout");
          expect(o[0].style.display).toEqual("none");
        });
      }
      checkRemoveComponent(id);
    });

    // DMM equipment
    describe("digital multimeter", function() {
      // add DDM on board, to test it behavior
      circuit.addDMM({
        "dial" : "acv_200",
        "black" : {
          "connection" : "f23",
          "draggable" : true
        },
        "red" : {
          "connection" : "h3",
          "draggable" : false
        }
      });
      // add wire to test hover events with probes
      var id = "uid0";
      circuit.addComponent({
        "type" : "wire",
        "UID" : id,
        "connections" : "a7,f17",
        "color" : "rgb(173,1,1)"
      });
      var lead = circuit.component[id].leads[1].wire;
      var colors = {// colors for each path
        '0' : ['51, 51, 51', '160,160,160', '229,229,229'],
        '1' : [' 51, 51,255', '160,160,255', '229,229,255'],
        '2' : ['130,110,150', '240,220,160', '255,255,255']
      }, color = [];
      // shortcut links
      var multimeter = $("#container").find("[info=multimeter]");
      var probe = {
        'black' : $("#container").find("[info=probe][name=black]"),
        'red' : $("#container").find("[info=probe][name=red]")
      }, bbox, matrix;
      probe.black.data('paper', circuit.holder[0]);
      // for drag simulations
      probe.red.data('paper', circuit.holder[0]);
      // for drag simulations
      var screen = multimeter.find('[type="dmm-screen-digits"] use');
      var tumbler = multimeter.find('[info="dmm-bttn"]');

      it("dmm, black and red probes were added", function() {
        expect(circuit.multimeter).toBeDefined();
        expect(multimeter.css('display')).toEqual('inline');
        expect(probe.black.css('visibility')).toEqual('visible');
        expect(probe.red.css('visibility')).toEqual('visible');
      });
      it("screen text was setted as default, rendered", function() {
        // correct length of char list
        expect(screen.length).toEqual(7);
        // check the real chars link
        expect(screen[0].getAttribute('xlink:href')).toEqual('#:dmm-digit- ');
        expect(screen[1].getAttribute('xlink:href')).toEqual('#:dmm-digit- ');
        expect(screen[2].getAttribute('xlink:href')).toEqual('#:dmm-digit-0');
        expect(screen[3].getAttribute('xlink:href')).toEqual('#:dmm-digit-.');
        expect(screen[4].getAttribute('xlink:href')).toEqual('#:dmm-digit-0');
        expect(screen[5].getAttribute('xlink:href')).toEqual('#:dmm-digit- ');
        expect(screen[6].getAttribute('xlink:href')).toEqual('#:dmm-digit-0');
        // check if chars rendered
        for (var i = screen.length; i--; ) {
          bbox = screen[i].getBBox();
          expect(bbox.height).toBeDefined();
          expect(bbox.width).toBeDefined();
        }
      });
      it("screen text can be setted by new value", function() {
        circuit.setDMMText('h 8.1 3');
        // check the real chars link
        expect(screen[0].getAttribute('xlink:href')).toEqual('#:dmm-digit-h');
        expect(screen[1].getAttribute('xlink:href')).toEqual('#:dmm-digit- ');
        expect(screen[2].getAttribute('xlink:href')).toEqual('#:dmm-digit-8');
        expect(screen[3].getAttribute('xlink:href')).toEqual('#:dmm-digit-.');
        expect(screen[4].getAttribute('xlink:href')).toEqual('#:dmm-digit-1');
        expect(screen[5].getAttribute('xlink:href')).toEqual('#:dmm-digit- ');
        expect(screen[6].getAttribute('xlink:href')).toEqual('#:dmm-digit-3');
        // check if chars rendered
        for (var i = screen.length; i--; ) {
          bbox = screen[i].getBBox();
          expect(bbox.height).toBeDefined();
          expect(bbox.width).toBeDefined();
        }
      });
      it("tumbler was set to the given value", function() {
        matrix = tumbler[0].getCTM();
        // check the angle of tumbler in DOM
        expect(tumbler.attr('transform')).toEqual('rotate(17)');
        // check the real transform of tumbler
        expect(matrix.a.toFixed(5)).toEqual('0.01793');
        expect(matrix.b.toFixed(5)).toEqual('0.00548');
        expect(matrix.c.toFixed(5)).toEqual('-0.00548');
        expect(matrix.d.toFixed(5)).toEqual('0.01793');
      });

      // we can't generate touch events
      if (!touch) {
        it("tumbler can to be set in new value", function() {
          // mousedown event check
          var c = breadboard.eventStatus.counter;
          tumbler.simulate("mousedown", {
            x : 0,
            y : 0
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("dmmDialMoved");
          expect(breadboard.eventStatus.eventData).toEqual("dcv_2000m");
          // angle 288
          matrix = tumbler[0].getCTM();
          // check the angle of tumbler in DOM
          expect(tumbler.attr('transform')).toEqual('rotate(288)');
          // check the real transform of tumbler
          expect(matrix.a.toFixed(5)).toEqual('0.01159');
          expect(matrix.b.toFixed(5)).toEqual('-0.03566');
          expect(matrix.c.toFixed(5)).toEqual('0.03566');
          expect(matrix.d.toFixed(5)).toEqual('0.01159');

          // drag event check
          tumbler.simulate("drag", {
            dx : 200,
            dy : 0
          });
          // angle 288
          matrix = tumbler[0].getCTM();
          // check the angle of tumbler in DOM
          expect(tumbler.attr('transform')).toEqual('rotate(52)');
          // check the real transform of tumbler
          expect(matrix.a.toFixed(5)).toEqual('0.02309');
          expect(matrix.b.toFixed(5)).toEqual('0.02955');
          expect(matrix.c.toFixed(5)).toEqual('-0.02955');
          expect(matrix.d.toFixed(5)).toEqual('0.02309');
        });
      }
      it("black probe placed correctly", function() {
        // check for f23 position in dom
        expect(probe.black.find('[type=initial]').attr('transform').replace(/\s|,/gi, '')).toEqual('translate(48807520)');
      });
      it("red probe placed correctly", function() {
        // check for h3 position in dom
        expect(probe.red.find('[type=initial]').attr('transform').replace(/\s|,/gi, '')).toEqual('translate(112808240)');
      });
      // we can't generate touch events
      if (!touch) {
        it("black probe draggable", function() {
          var trn1 = probe.black.attr('transform');
          probe.black.simulate("drag", {
            dx : 15,
            dy : 15
          });
          var trn2 = probe.black.attr('transform');
          // draggable
          expect(trn1).not.toEqual(trn2);
        });
        it("red probe not draggable", function() {
          var trn1 = probe.red.attr('transform');
          probe.red.simulate("drag", {
            dx : 10,
            dy : 10
          });
          var trn2 = probe.red.attr('transform');
          // not draggable
          expect(trn1).toEqual(trn2);
        });
        it("lead highlighted, if probe over it", function() {
          // initail color of lead
          color.push([lead.eq(0).attr('stroke'), lead.eq(1).attr('stroke'), lead.eq(2).attr('stroke')]);
          // move probe, check all colors
          probe.black.simulate("mousedown");
          circuit.holder.simulate("mousemove", {
            clientX : 0,
            clientY : 0
          });
          circuit.holder.simulate("mousemove", {
            clientX : 90,
            clientY : -15
          });
          color.push([lead.eq(0).attr('stroke'), lead.eq(1).attr('stroke'), lead.eq(2).attr('stroke')]);
          circuit.holder.simulate("mouseup");
          color.push([lead.eq(0).attr('stroke'), lead.eq(1).attr('stroke'), lead.eq(2).attr('stroke')]);
          // check colors in SVG DOM
          for (var m = color.length; m--; ) {
            for (var l = color[m].length; l--; ) {
              expect(color[m][l].replace(/ /gi, '')).toEqual(('rgb(' + colors[m][l] + ')').replace(/ /gi, ''));
            }
          }
          // check model
          expect(circuit.component[id].leads[1].probe).toBeDefined();
        });

        it("black probe disconnected from lead and sent event(probeRemoved)", function() {
          var c = breadboard.eventStatus.counter;
          probe.black.simulate("drag", {
            dx : -90,
            dy : 15
          });
          expect(circuit.multimeter.probe.black.lead).toEqual(null);
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("probeRemoved");
          expect(breadboard.eventStatus.eventData).toEqual("dmm|black");
        });

        it("black probe connected to lead and sent event(probeAdded)", function() {
          var c = breadboard.eventStatus.counter;
          probe.black.simulate("drag", {
            dx : 90,
            dy : -15
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("probeAdded");
          expect(breadboard.eventStatus.eventData).toEqual("dmm|black|f17");
        });
      }
      it("dmm, black and red probes were removed", function() {
        circuit.removeDMM();
        circuit.removeComponent(id);
        expect(multimeter.css('display')).toContain('none');
        expect(probe.black.css('visibility')).toContain('hidden');
        expect(probe.red.css('visibility')).toContain('hidden');
      });
    });

    // OScope equipment
    describe("oscilloscope (yellow and pink probes)", function() {
      // add probes, to test it behavior
      circuit.addOScope({
        "yellow" : {
          "connection" : "left_positive21",
          "draggable" : false
        },
        "pink" : {
          "connection" : "h28",
          "draggable" : true
        }
      });
      var probe = {
        'yellow' : $("#container").find("[info=probe][name=yellow]"),
        'pink' : $("#container").find("[info=probe][name=pink]")
      };
      // add wire to test hover events with probes
      var id = "uid9";
      circuit.addComponent({
        "type" : "wire",
        "UID" : id,
        "connections" : "d24,d2",
        "color" : "rgb(173,1,1)"
      });

      it("yellow and pink probes were added", function() {
        expect(probe.yellow.css('visibility')).toEqual('visible');
        expect(probe.pink.css('visibility')).toEqual('visible');
      });
      it("yellow probe placed correctly", function() {
        // check for left_positive21 position in dom
        expect(probe.yellow.find('[type=initial]').attr('transform').replace(/\s|,/gi, '')).toEqual('translate(40804320)');
      });
      it("pink probe placed correctly", function() {
        // check for h28 position in dom
        expect(probe.pink.find('[type=initial]').attr('transform').replace(/\s|,/gi, '')).toEqual('translate(32808240)');
      });
      // we can't generate touch events
      if (!touch) {
        it("yellow probe not draggable", function() {
          var trn1 = probe.yellow.attr('transform');
          probe.yellow.simulate("drag", {
            dx : 10,
            dy : 10
          });
          var trn2 = probe.yellow.attr('transform');
          // not draggable
          expect(trn1).toEqual(trn2);
        });
        it("pink probe draggable", function() {
          var trn1 = probe.pink.attr('transform');
          probe.pink.simulate("drag", {
            dx : 10,
            dy : 10
          });
          var trn2 = probe.pink.attr('transform');
          // draggable
          expect(trn1).not.toEqual(trn2);
        });

        it("pink probe connected to lead and sent event(probeAdded)", function() {
          var c = breadboard.eventStatus.counter;
          probe.pink.simulate("drag", {
            dx : 65,
            dy : -90
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("probeAdded");
          expect(breadboard.eventStatus.eventData).toEqual("oscope|pink|d24");
        });

        it("pink probe disconnected from lead and sent event(probeRemoved)", function() {
          var c = breadboard.eventStatus.counter;
          probe.pink.simulate("drag", {
            dx : -90,
            dy : 15
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("probeRemoved");
          expect(breadboard.eventStatus.eventData).toEqual("oscope|pink");
        });

      }
      it("yellow and pink probes were removed", function() {
        circuit.removeOScope();
        circuit.removeComponent(id);
        expect(probe.yellow.css('visibility')).toContain('hidden');
        expect(probe.pink.css('visibility')).toContain('hidden');
      });
    });

    // we can't generate touch events
    if (!touch) {
      // Lead can be draggable
      describe("lead can be draggable", function() {
        var id = 'uid7', trn1, trn2;
        circuit.addComponent({
          "type" : "inductor",
          "UID" : id,
          "connections" : "b23,b10",
          "label" : "I1",
          "draggable" : true
        });
        var elem = circuit.component[id];
        var lead1 = elem.leads[0].view;
        var lead2 = elem.leads[1].view;
        lead1.action = lead1.find('[type="action"]');
        lead2.action = lead2.find('[type="action"]');
        lead1.action.data('paper', circuit.holder[0]);
        lead2.action.data('paper', circuit.holder[0]);

        it("leads is draggable", function() {
          // initail transforms
          trn1 = lead1.attr('transform');
          trn2 = lead2.attr('transform');
          // drag leads
          lead1.action.simulate("drag", {
            dx : 10,
            dy : -10
          });
          lead2.action.simulate("drag", {
            dx : 10,
            dy : -10
          });
          // actual transforms
          expect(trn1).not.toEqual(lead1.attr('transform'));
          expect(trn2).not.toEqual(lead2.attr('transform'));
        });
        it("holes can be highlighted", function() {
          lead1.action.simulate('mousedown');
          expect(circuit.holes[elem.leads[0].hole].view.attr('xlink:href')).toEqual('#$:hole_highlighted');

          circuit.holder.simulate("mousemove", {
            clientX : 90,
            clientY : -15
          });
          expect(circuit.holes[elem.leads[0].hole].view.attr('xlink:href')).toEqual('#$:hole_not_connected');
          expect(circuit.holes['a16'].view.attr('xlink:href')).toEqual('#$:hole_highlighted');
          circuit.holder.simulate("mousemove", {
            clientX : 0,
            clientY : 55
          });
          expect(circuit.holes['a16'].view.attr('xlink:href')).toEqual('#$:hole_not_connected');
          expect(circuit.holes['d22'].view.attr('xlink:href')).toEqual('#$:hole_highlighted');

          circuit.holder.simulate("mouseup");
          // the hole mast be with name d22
          expect(circuit.holes[elem.leads[0].hole].view.attr('xlink:href')).toEqual('#$:hole_connected');

          // clear circuit-board
          circuit.holes[elem.leads[0].hole].disconnected();
          circuit.holes[elem.leads[1].hole].disconnected();
        });

        it("leads sent only one events when it lifted, dragged and then returned to initial position", function() {
          var c = breadboard.eventStatus.counter;
          lead1.action.simulate('mousedown');
          circuit.holder.simulate("mousemove", {
            clientX : -100,
            clientY : 0
          });
          circuit.holder.simulate("mousemove", {
            clientX : 100,
            clientY : 0
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          circuit.holes["d16"].num = 0;
          circuit.holes["d16"].view.attr('xlink:href', '#$:hole_not_connected');
        });

        it("leads sent only one events when it disconnected and then dragged", function() {
          var c = breadboard.eventStatus.counter;
          lead1.action.simulate('mousedown');
          lead1.action.simulate('mouseup');
          lead1.action.simulate('mousedown');
          circuit.holder.simulate("mousemove", {
            clientX : -100,
            clientY : 0
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
        });

        it("leads sent events when component lifted(connectionBroken)", function() {
          var c = breadboard.eventStatus.counter;
          lead1.action.simulate('mousedown');
          circuit.holder.simulate("mousemove", {
            clientX : -100,
            clientY : 0
          });

          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionBroken");
          expect(breadboard.eventStatus.eventData).toEqual("uid7|d22");
        });

        it("leads sent events when component connected(connectionMade)", function() {
          var c = breadboard.eventStatus.counter;
          circuit.holder.simulate("mouseup");
          expect(breadboard.eventStatus.counter).toEqual(c + 1);
          expect(breadboard.eventStatus.eventName).toEqual("connectionMade");
          expect(breadboard.eventStatus.eventData).toEqual("uid7|d28");

          // remove component and return initial position of holes
          circuit.holes["d22"].num = 0;
          circuit.holes["d28"].num = 0;
          circuit.holes["d22"].view.attr('xlink:href', '#$:hole_not_connected');
          circuit.holes["d28"].view.attr('xlink:href', '#$:hole_not_connected');
          circuit.removeComponent(id);
        });

      });

      // Component can be draggable
      describe("component can be draggable", function() {
        var id = 'uid8', trn1, trn2;
        circuit.addComponent({
          "type" : "inductor",
          "UID" : id,
          "connections" : "f20,i26",
          "label" : "I1",
          "draggable" : true
        });
        var component = circuit.component[id];
        var element = component.element.view;
        var lead1 = component.leads[0];
        var lead2 = component.leads[1];
        element.data('paper', circuit.holder[0]);

        it("component is draggable", function() {
          // initail transforms
          trn1 = lead1.view.attr('transform');
          trn2 = lead2.view.attr('transform');
          // drag leads
          element.simulate("drag", {
            dx : 20,
            dy : 40
          });
          // actual transforms
          expect(trn1).not.toEqual(lead1.view.attr('transform'));
          expect(trn2).not.toEqual(lead2.view.attr('transform'));
        });

        it("component on top layer", function() {
          var cmps = circuit.holder.find('[item="components"]').children().last()[0];
          expect(cmps).toEqual(component.view[0]);
        });

        it("holes can be highlighted", function() {
          element.simulate('mousedown');
          expect(circuit.holes[lead1.hole].view.attr('xlink:href')).toEqual('#$:hole_highlighted');
          expect(circuit.holes[lead2.hole].view.attr('xlink:href')).toEqual('#$:hole_highlighted');
          circuit.holder.simulate("mousemove", {
            clientX : 90,
            clientY : 0
          });
          expect(circuit.holes[lead1.hole].view.attr('xlink:href')).toEqual('#$:hole_not_connected');
          expect(circuit.holes[lead2.hole].view.attr('xlink:href')).toEqual('#$:hole_not_connected');
          expect(circuit.holes['h13'].view.attr('xlink:href')).toEqual('#$:hole_highlighted');
          expect(circuit.holes['right_positive16'].view.attr('xlink:href')).toEqual('#$:hole_highlighted');

          circuit.holder.simulate("mouseup");
          expect(circuit.holes[lead1.hole].view.attr('xlink:href')).toEqual('#$:hole_connected');
          expect(circuit.holes[lead2.hole].view.attr('xlink:href')).toEqual('#$:hole_connected');

          // clear circuit-board
          circuit.holes[component.leads[0].hole].disconnected();
          circuit.holes[component.leads[1].hole].disconnected();
        });

        it("leads sent events when component lifted(connectionBroken)", function() {
          var c = breadboard.eventStatus.counter;
          element.simulate('mousedown');
          circuit.holder.simulate("mousemove", {
            clientX : -20,
            clientY : -40
          });
          expect(breadboard.eventStatus.counter).toEqual(c + 2);
          expect(breadboard.eventStatus.eventName).toEqual("connectionBroken");
        });

        it("leads sent events when component connected(connectionMade)", function() {
          var c = breadboard.eventStatus.counter;
          circuit.holder.simulate("mouseup");
          expect(breadboard.eventStatus.counter).toEqual(c + 2);
          expect(breadboard.eventStatus.eventName).toEqual("connectionMade");

          // remove component and return initial position of holes
          circuit.holes["h13"].num = 0;
          circuit.holes["right_positive16"].num = 0;
          circuit.holes["h13"].view.attr('xlink:href', '#$:hole_not_connected');
          circuit.holes["right_positive16"].view.attr('xlink:href', '#$:hole_not_connected');
          circuit.removeComponent(id);
        });


      });
    }
  });
  runTests();
};
var runTests = function() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
  var trivialReporter = new jasmine.TrivialReporter();
  jasmineEnv.addReporter(trivialReporter);

  jasmineEnv.specFilter = function(spec) {
    return trivialReporter.specFilter(spec);
  };
  var currentWindowOnload = window.onload;

  if (currentWindowOnload) {
    currentWindowOnload();
  }
  execJasmine();
  function execJasmine() {

    jasmineEnv.execute();
    $("#TrivialReporter")[0].style.position = "static";
  }

};

var createFakeModel = function() {
  window["breadboard"].eventStatus = {
    counter : 0,
    eventName : "name",
    eventData : ""
  };

  window["breadboard"].connectionMade = function(component, location) {
    this.eventStatus.counter++;
    this.eventStatus.eventName = "connectionMade";
    this.eventStatus.eventData = component + '|' + location;
  };

  window["breadboard"].connectionBroken = function(component, location) {
    this.eventStatus.counter++;
    this.eventStatus.eventName = "connectionBroken";
    this.eventStatus.eventData = component + '|' + location;
  };

  window["breadboard"].probeAdded = function(meter, color, location) {
    this.eventStatus.counter++;
    this.eventStatus.eventName = "probeAdded";
    this.eventStatus.eventData = meter + '|' + color + '|' + location;
  };

  window["breadboard"].probeRemoved = function(meter, color) {
    this.eventStatus.counter++;
    this.eventStatus.eventName = "probeRemoved";
    this.eventStatus.eventData = meter + '|' + color;
  };

  window["breadboard"].dmmDialMoved = function(value) {
    this.eventStatus.counter++;
    this.eventStatus.eventName = "dmmDialMoved";
    this.eventStatus.eventData = value;
  };
};
