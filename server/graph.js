import Parser from "tree-sitter";
import Java from "tree-sitter-java";
import fs from "fs";
import path from "path";
import * as qn from "./qualifiedName.js";
import { log } from "console";

const parser = new Parser();
parser.setLanguage(Java);

export let sourceCode = "";

function getJavaFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      getJavaFiles(filePath);
    } else if (path.extname(file) === ".java") {
      const data = fs.readFileSync(filePath, "utf8");
      sourceCode += data + "\n";
    }
  });
}

const dirPath = "../matrices";
getJavaFiles(dirPath);

const tree = parser.parse(sourceCode);

// var descendantsTree = [];

function parcoursTree(node, parent, descendantsTree, nodes) {
  nodes[node.type]?.push({
    name: node.nameNode
      ? node.nameNode.text
      : node.descendantsOfType("identifier")[0].text,
    node: node,
    id: node.id,
  });
  const types = [
    "class_declaration",
    "method_declaration",
    "field_declaration",
    "local_variable_declaration",
    "type_identifier",
    "constructor_declaration",
  ];

  const childrens = node.children;
  var pendingPackage = null;
  for (let i = 0; i < childrens.length; i++) {
    const child = childrens[i];
    if (child.type == "package_declaration") {
      // si on rencontre un package
      pendingPackage = qn.packageDecl(child);
    }
    if (childrens[i].type == "class_declaration" && pendingPackage) {
      // si il s'agit d'une classe et qu'on est dans un package
      descendantsTree.push({
        // on ajoute le package
        id: pendingPackage,
        name: pendingPackage,
        parent: null,
        type: "package_declaration",
      });
      descendantsTree.push({
        // on ajoute la classe
        id: child.id,
        name: qn.getNodeName(child), //pendingPackage + "." + qn.classDecl(childrens[i]),
        parent: pendingPackage,
        type: child.type,
        node: child,
      });
      pendingPackage = null; // le package ne concerne qu'une seule classe
    } else if (types.includes(child.type)) {
      // si le type de l'enfant est dans la liste des types
      if (child.type == "constructor_declaration") {
        log(child);
      }
      if (types.includes(node.type)) {
        descendantsTree.push({
          id: child.id,
          name: qn.getNodeName(child),
          parent: node.id,
          type: child.type,
          node: child,
        });
      } else {
        descendantsTree.push({
          id: child.id,
          name: qn.getNodeName(child),
          parent: parent ? parent.id : null,
          type: child.type,
          node: child,
        });
      }
    }
    if (types.includes(node.type)) {
      // si le type du noeud est dans la liste des types
      parcoursTree(child, node, descendantsTree, nodes); // le noeud devient le parent lors du prochain appel
    } else {
      parcoursTree(child, parent, descendantsTree, nodes); // le parent reste le même
    }
  }
}

// Combine nodes and links
export const cyData = processSourceCode(sourceCode);
// console.log(cyData);
// log(nodes)
export function processSourceCode(sourceCode) {
  const tree = parser.parse(sourceCode);
  const descendantsTree = [];
  const nodes = {
    class_declaration: [],
    constructor_declaration: [],
    // object_creation_expression: [],
    method_declaration: [],
    field_declaration: [],
    local_variable_declaration: [],
  };
  parcoursTree(tree.rootNode, null, descendantsTree, nodes);
  const cyNodes = descendantsTree
    .filter(
      (node) =>
        node.type !== "type_identifier" ||
        !nodes["class_declaration"].find((e) => e.name == node.name)
    )
    .map((node) => ({
      data: { id: node.id, name: node.name, type: node.type },
    }));
  const cyEdges = descendantsTree
    .filter((node) => node.parent !== null)
    .map((node) => mapNodeToData(node, nodes));
  const cyData2 = [...cyNodes, ...cyEdges];
  return cyData2;
}

function mapNodeToData(node, nodes) {
  // if(node.type == "type_identifier"){
  //   log(nodes["class_declaration"].find(e=>e.name == "XY"))
  // }
  // log(node.name)
  const e = nodes["class_declaration"].find((e) => e.name == node.name);
  if (node.type == "type_identifier" && e) {
    if (node.node.parent.type == "object_creation_expression") {
      const e = nodes["constructor_declaration"].find((e) => e.name == node.name);
      return {
        data: { source: node.parent, target: e.id },
        classes: "arrow",
      };
    }
    return {
      data: { source: node.parent, target: e.id },
      classes: "arrow",
    };
  }

  return {
    data: { source: node.parent, target: node.id },
    classes: "normal",
  };
}
