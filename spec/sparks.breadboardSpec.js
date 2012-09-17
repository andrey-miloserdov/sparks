var loading = setInterval(function() {
  if(breadboard.ready) {
    clearInterval(loading);
    start_test();
  }
}, 100);
var start_test = function() {

  //toContain was used to solve problem with different rendering in Chrome, IE, Firefox and Safari

  describe("On the breadboard", function() {
    var circuit = breadboard.create("container");

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
    describe("wire", function() {
      var id = "uid1";

      it("was created", function() {
        circuit.addComponent({
          "type" : "wire",
          "UID" : id,
          "connections" : "f13,a3",
          "color" : "rgb(173,1,1)"
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(6084);
				var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(428);
        expect(parseInt(ctm.f, 10)).toEqual(318);
        
        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

      });
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
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(18810);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(158);
        expect(parseInt(ctm.f, 10)).toEqual(395);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

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
          "label" : "label"
        });
        expect(circuit.component[id]).toBeDefined();
      });
      checkCreateComponent(id);
      it("placed in correct position", function() {

        //connector test
        var bbox = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(13603);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(0).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(269);
        expect(parseInt(ctm.f, 10)).toEqual(254);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(2)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //inductor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        expect([648, 622]).toContain(parseInt(bbox.height, 10));
        expect([1118, 1116, 995]).toContain(parseInt(bbox.width, 10));
        expect([-409, -408]).toContain(parseInt(bbox.x, 10));
        expect([-209, -196]).toContain(parseInt(bbox.y, 10));

        //label test
        $("#container").find("[type=label]").attr("display", "inline");
        bbox = $("#container").find("[type=label]")[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(719);
        expect([1464, 1388, 1440, 1543]).toContain(parseInt(bbox.width, 10));
        expect(parseInt(bbox.x, 10)).toEqual(-193);
        expect(parseInt(bbox.y, 10)).toEqual(-75);

      });
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
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(17524);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(159);
        expect(parseInt(ctm.f, 10)).toEqual(369);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //resistor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3).find('>g>g').eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(64);
        expect(parseInt(bbox.width, 10)).toEqual(190);
        expect(parseInt(bbox.x, 10)).toEqual(-94);
        expect(parseInt(bbox.y, 10)).toEqual(-32);

        //label test
        $("#container").find("[type=label]").attr("display", "inline");
        bbox = $("#container").find("[type=label]")[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(5522);
        expect(parseInt(bbox.width, 10)).toEqual(6964);
        expect(parseInt(bbox.x, 10)).toEqual(-14);
        expect(parseInt(bbox.y, 10)).toEqual(-12);

      });
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
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(8133);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(466);
        expect(parseInt(ctm.f, 10)).toEqual(331);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //resistor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(576);
        expect(parseInt(bbox.width, 10)).toEqual(1710);
        expect(parseInt(bbox.x, 10)).toEqual(-846);
        expect(parseInt(bbox.y, 10)).toEqual(-138);

        //label test
        $("#container").find("[type=label]").attr("display", "inline");
        bbox = $("#container").find("[type=label]")[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(24);
        expect(parseInt(bbox.width, 10)).toEqual(28);
        expect(parseInt(bbox.x, 10)).toEqual(-14);
        expect(parseInt(bbox.y, 10)).toEqual(-12);

      });
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
        expect(parseInt(bbox.height, 10)).toEqual(0);
        expect(parseInt(bbox.width, 10)).toEqual(11466);
        var ctm = $("#container").find("[uid=" + id + "]>g").eq(2).find('>g>g path').eq(0)[0].getCTM();
        expect(parseInt(ctm.e, 10)).toEqual(159);
        expect(parseInt(ctm.f, 10)).toEqual(299);

        //lead_0 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(0)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-494);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //lead_1 test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(1)[0].getBBox();
        expect(parseInt(bbox.height, 10)).toEqual(720);
        expect(parseInt(bbox.width, 10)).toEqual(774);
        expect(parseInt(bbox.x, 10)).toEqual(-20);
        expect(parseInt(bbox.y, 10)).toEqual(-200);

        //capacitor test
        bbox = $("#container").find("[uid=" + id + "]>g").eq(3)[0].getBBox();
        expect([632, 628]).toContain(parseInt(bbox.height, 10));
        expect([631, 629]).toContain(parseInt(bbox.width, 10));
        expect([-174, -173]).toContain(parseInt(bbox.x, 10));
        expect([-221, -218]).toContain(parseInt(bbox.y, 10));

        //label test
        $("#container").find("[type=label]").attr("display", "inline");
        bbox = $("#container").find("[type=label]")[0].getBBox();
        expect([18, 17, 16]).toContain(parseInt(bbox.height, 10));
        expect([17, 19, 20, 21]).toContain(parseInt(bbox.width, 10));
        expect([-10, -11]).toContain(parseInt(bbox.x, 10));
        expect([-8, -9, -7]).toContain(parseInt(bbox.y, 10));

      });
      checkRemoveComponent(id);
    });
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

  if(currentWindowOnload) {
    currentWindowOnload();
  }
  execJasmine();
  function execJasmine() {

    jasmineEnv.execute();
  }

};
