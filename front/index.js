var myTextarea = document.getElementById("sourceCode");
export var editor = CodeMirror.fromTextArea(myTextarea, {
  lineNumbers: true
});
editor.getWrapperElement().style.resize = "both";
editor.getWrapperElement().style.overflow = "auto";
editor.getWrapperElement().style.border = "1px solid #ccc";
editor.getWrapperElement().style.width = "50%";
export function editorSetValue(sourceCode) {
  editor.setValue(sourceCode);
}
export function updateGraph(elements) {
  document.getElementById("cy").innerHTML = "";
  const typeColor ={
      package_declaration: "green",
      class_declaration: "yellow",
      method_declaration: "purple",
      field_declaration: "orange",
      local_variable_declaration: "red",
      default: "grey"
  }
  // Initialisation de Cytoscape
  
  var cy = cytoscape({
    container: document.getElementById("cy"), // Container pour le graphique
    elements: elements,
    style: [
      // Style des nœuds et des liens
      {
        selector: "node",
        style: {
          "background-color": function(node) {
              const type = node.data('type');
              return typeColor[type] || typeColor.default;},
          label: "data(name)",
          color: "black",
          "text-valign": "center",
          "text-halign": "center",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#bbb",
          "target-arrow-shape": "triangle",
          'curve-style': 'bezier',
        },
      },
      {
        selector: 'edge.use',
        style: {
          width: 3,
          "line-color": "#ccc",
          "target-arrow-shape": "triangle",
          'curve-style': 'bezier',
          'line-style': 'dashed'

        },
      },
    ],
    layout: {
      name: "breadthfirst", // Disposition du graphique
      directed: true,
      padding: 10,
    },
  });

  // Activer le drag des nœuds
  cy.nodes().on("drag", function (event) {
    var node = event.target;
    console.log("Dragged node", node.id());
  });
  cy.nodes().on("click", function (event) {
    console.log("Dragged node", event.target);
  });


}