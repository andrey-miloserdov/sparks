var loading = setInterval(function() {
  if(breadboard.ready) {
    clearInterval(loading);
    start_test.call(window);
  }
}, 100);
var start_test = function() {

  describe("On the breadboard", function() {
    var circuit = breadboard.create("container");

    var id = "uid1";

    it("was created a wire", function() {
      circuit.addComponent({
        "type" : "wire",
        "UID" : id,
        "connections" : "f13,a3",
        "label" : "label",
        "properties" : {
          "color" : "rgb(173,1,1)"
        }
      });
      expect(circuit.component[id]).toBeDefined();
    });
    it("wire appeared in DOM", function() {
      expect($("#container").find("[uid=" + id + "]").length).toEqual(1);
    });
    it("wire was removed", function() {
      circuit.removeComponent(id);
      expect(circuit.component[id]).toBeNull();
    });
    it("wire disappeared from DOM", function() {
      expect($("#container").find("[uid=" + id + "]").length).toEqual(0);
    });
  });
};
