var myTextarea = document.getElementById("sourceCode");
export var editor = CodeMirror.fromTextArea(myTextarea, {
  lineNumbers: true
});
editor.getWrapperElement().style.resize = "both";
editor.getWrapperElement().style.overflow = "auto";
editor.getWrapperElement().style.border = "1px solid #ccc";
editor.getWrapperElement().style.width = "100%";
export function editorSetValue(sourceCode) {
  editor.setValue(sourceCode);
}
export function updateGraph(elements) {
  initCytoscape("cy2",elements.finalTree);
  window.elements = elements;

}
window.showInitialTree = function showInitialTree() {
  initCytoscape("cy",window.elements.initialTree);
}
export function initCytoscape(containerId,elements) {
  document.getElementById(containerId).innerHTML = "";
  const typeColor ={
      package_declaration: "green",
      class_declaration: "yellow",
      method_declaration: "purple",
      field_declaration: "orange",
      local_variable_declaration: "brown",
      constructor_declaration: "blue",
      default: "grey"
  }
  // Initialisation de Cytoscape
  
  var cy = cytoscape({
    container: document.getElementById(containerId), // Container pour le graphique
    elements: elements,
    style: [
      // Style des nœuds et des liens
      {
        selector: "node",
        style: {
          "background-color": 'white',
          "label": "data(name)",
          "color": "black",
          "text-valign": "center",
          "text-halign": "center",
          // "shape": "rectangle",
          "font-size": "12px", // Ajustez selon vos besoins
          "text-wrap": "wrap", // Active l'enveloppement du texte
          "text-max-width": "80px", // Ajustez selon vos besoins
          // "width": "label", // Ajuste la largeur du nœud en fonction du label
          // "height": "label", // Ajuste la hauteur du nœud en fonction du label
          "padding": "5px", // Largeur de la bordure des nœuds
          'border-width': 3, // Largeur de la bordure des nœuds
          'border-color': function(node) {
              const type = node.data('type');
              return typeColor[type] || typeColor.default;
            }, 
        }
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
        selector: 'edge.contain',
        style: {
          width: 3,
          "line-color": "#ccc",
          'line-style': 'dashed'

        },
      },
      {
        selector: 'edge.import',
        style: {
          width: 3,
          "line-color": "blue",
          "target-arrow-color": "blue",
          'line-style': 'dashed'

        },
      },
      {
        selector: 'edge.use',
        style: {
          width: 3,
          "line-color": "green",
          "target-arrow-color": "green",

        },
      },
      {
        selector: 'edge.ambiguousUsage',
        style: {
          width: 3,
          "line-color": "orange",
          "target-arrow-color": "orange",

        },
      },
      {
        selector: 'edge.useError',
        style: {
          width: 3,
          "line-color": "red",
          "target-arrow-color": "red",

        },
      },
    ],
    layout: {
      name: "dagre", // Disposition du graphique breadthfirst
      rankDir: 'TB', // Direction du graphe, TB = de haut en bas
    // align: 'UL',
      nodeSep: 10, // Espacement entre les nœuds adjacents dans la même rangée ou colonne
      edgeSep: 10, // Espacement entre les arêtes adjacentes
      rankSep: 10,// Espacement entre chaque rangée ou colonne
    },
    // layout: {
    //   name: "cose", // Utiliser la mise en page COSE
    //   // Paramètres spécifiques à COSE
    //   nodeRepulsion: 400000,
    //   idealEdgeLength: 100,
    //   componentSpacing: 100,
    //   nodeOverlap: 10,
    // },
  });

  // Activer le drag des nœuds
  cy.nodes().on("drag", function (event) {
    var node = event.target;
    console.log("Dragged node", node.id());
  });
  cy.nodes().on("click", function (event) {
    console.log("Dragged node", event.target);
  });


  cy.on('click', 'node', function(event) {
    var node = event.target;
    console.log('Propriétés du nœud :', node.data());
    // Vous pouvez accéder à des propriétés spécifiques comme ceci :
    // console.log('ID du nœud :', node.data('id'));
    // Affichez d'autres propriétés ou manipulez-les selon vos besoins.
  });
}

window.addTypes = function () {
  const form = document.getElementById('typeForm');
  const selectedTypes = Array.from(form.elements.type)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  // Ajoutez les types sélectionnés à votre tableau ici
  console.log(selectedTypes);
}

var elements = [
  {
    data: { id: 'calcul', name: 'calcul', type: 'package_declaration' }
  },
  {
    data: {
      id: 94584748169184,
      name: 'calcul.Calcul',
      type: 'class_declaration'
    }
  },
  {
    data: {
      id: 94584747897216,
      name: 'calcul.MatriceCreuse',
      type: 'class_declaration'
    }
  },
  {
    data: {
      id: 94584747867784,
      name: 'calcul.MatriceCreuse.XY',
      type: 'class_declaration'
    }
  },
  {
    data: {
      id: 94584749117520,
      name: 'calcul.MatricePleine',
      type: 'class_declaration'
    }
  },
  {
    data: {
      id: 'org.example',
      name: 'org.example',
      type: 'package_declaration'
    }
  },
  {
    data: {
      id: 94584749022000,
      name: 'org.example.Main',
      type: 'class_declaration'
    }
  },
  {
    data: { source: 'calcul', target: 94584748169184 },
    classes: 'contain'
  },
  {
    data: { source: 'calcul', target: 94584747897216 },
    classes: 'contain'
  },
  {
    data: { source: 94584747897216, target: 94584747867784 },
    classes: 'contain'
  },
  {
    data: { source: 'calcul', target: 94584749117520 },
    classes: 'contain'
  },
  {
    data: { source: 'org.example', target: 94584749022000 },
    classes: 'contain'
  }
]
