import Parser from "tree-sitter";
import Java from "tree-sitter-java";
import fs from "fs";
import path from "path";
import * as qn from "./qualifiedName.js";
import { log } from "console";
import { projectTree } from "./treeParse.js";
import { get } from "http";
import { start } from "repl";
import { getGraph } from "./getGraph.js";

const parser = new Parser();
parser.setLanguage(Java);

export let sourceCode = "";
function getName(node){
  var name
  if (node.type == "type_identifier") {
    name=node.text
  }else{
    // log(node)
    name = node.nameNode
  ? node.nameNode.text
  : node.descendantsOfType("identifier")[0].text
  }
  return name
}
function getNodes(node, nodes) {
   if(nodes[node.type])nodes[node.type][getName(node)]=node.id
  //   name: getName(node),
  //   node: node,
  //   id: node.id,
  // };
  const childrens = node.children;
  for (let i = 0; i < childrens.length; i++) {
    const child = childrens[i];
    getNodes(child, nodes);
  }
}
function parcoursTree(node, parent, descendantsTree, nodes,types) {

  const childrens = node.children;
  var pendingPackage = null;
  var imports = [];
  for (let i = 0; i < childrens.length; i++) {
    const child = childrens[i];
    if (child.type == "package_declaration") {
      // si on rencontre un package
      pendingPackage = qn.getNodeName(child);
    }
    if (child.type == "import_declaration") {
      imports.push(qn.getNodeName(child));
    }
    if (childrens[i].type == "class_declaration") {
      // si il s'agit d'une classe et qu'on est dans un package
      if (pendingPackage){
        descendantsTree.set(pendingPackage, {
          name: pendingPackage,
          parent: null,
          type: "package_declaration",
        });
      }
      
      const prefix = pendingPackage??descendantsTree.get(parent?.id)?.name
      descendantsTree.set(child.id, {
        name: (prefix?prefix+'.':'')+qn.getNodeName(child),
        parent: pendingPackage??parent?.id,
        type: child.type,
        node: child,
        imports: imports,
      });
      pendingPackage = null; // le package ne concerne qu'une seule classe
      // console.log(imports);
      imports = [];
    } else if (types.includes(child.type)) {
      // si le type de l'enfant est dans la liste des types
      // if (child.type == "type_identifier" && !nodes["class_declaration"].find((e) => e.name == child.text)) {
      // }else 
      if(child.type == "type_identifier" ){
        // log(child.text)
      }
      if (types.includes(node.type)) {// si le type du parent est dans la liste des types le parent devient le parent du noeud
        const prefix = descendantsTree.get(node.id).name;
        const isType = child.type == "type_identifier"
        // isType && log(child)
        descendantsTree.set(child.id, {
          name: (isType?'':prefix+'.')+qn.getNodeName(child),
          parent: node.id,
          type: child.type,
          node: child,
        });
      } else {// si le type du parent n'est pas dans la liste des types on prend le parent du parent
        const prefix = descendantsTree.get(parent?.id)?.name;
        const isType = child.type == "type_identifier"
        descendantsTree.set(child.id, {
          name: (isType?'':prefix+'.')+qn.getNodeName(child),
          parent: parent?.id,
          type: child.type,
          node: child,
        });
      }
    }
    if (types.includes(node.type)) {
      // si le type du noeud est dans la liste des types
      parcoursTree(child, node, descendantsTree, nodes,types); // le noeud devient le parent lors du prochain appel
    } else {
      parcoursTree(child, parent, descendantsTree, nodes,types); // le parent reste le même
    }
  }
}

// Combine nodes and links
// export const cyData = processSourceCode(sourceCode);
// console.log(cyData);
// log(nodes)

function mapNodeToData(id,node, nodes,types,tree) {
  // if (node.name == "XY") log(node)
  if (node.type == "class_declaration" && node.name == "calcul.MatriceCreuse.XY") {
    // log(node.node.closest("class_declaration").nameNode.text);  
    // log(node);

    // log(node.closest("class_declaration"));
    }
  // if(node.type == "type_identifier"){
  //   log(nodes["class_declaration"].find(e=>e.name == "XY"))
  // }
  // log(node.name)
  // const classUse = nodes["class_declaration"].find((e) => e.name == node.name); // si le nom du noeud est une classe
  // const constructorUse = nodes["constructor_declaration"].find((e) => e.name == node.name);
  if ( node.type == "type_identifier") {
    // if (classUse) {
    //   return {
    //     data: { source: node.parent, target: classUse.id },
    //     classes: "use",nodes
    //   };
    // }else if (types.includes("constructor_declaration") && node.node.parent.type == "object_creation_expression" && constructorUse) {
    //   return {
    //     data: { source: node.parent, target: constructorUse.id },
    //     classes: "use",
    //   };
    // }else
    return {
      data: { source: node.parent, target: id },
      classes: "use",
    };
    
  }
  // console.log(node.parent);
  return {
    data: { source: node.parent, target: id },
    classes: "contain",
  };
}
export function processSourceCode(tree,types) {
  // log(tree.rootNode);
  
  const nodes = {
    class_declaration: [],
    constructor_declaration: [],
    method_declaration: [],
    field_declaration: [],
    local_variable_declaration: [],
    type_identifier: [],
    };
  // log(nodes)
  // const tree = parser.parse(sourceCode);
  const descendantsTree = new Map();
  getNodes(tree.rootNode, nodes);
  // log(nodes)

  parcoursTree(tree.rootNode, null, descendantsTree, nodes,types);
  const cyNodes = Array.from(descendantsTree).map(([id, node]) => ({
    data: { id, name: node.name, type: node.type },
  }));
  const cyEdges = Array.from(descendantsTree)
  .filter(([id, node]) => node.parent)
  .map(([id, node])=> mapNodeToData(id,node, nodes,types,tree));
  parcoursDescTree(descendantsTree,nodes)
  // log(nodes)

  // log(descendantsTree)
  // const cyNodes = descendantsTree
  // .map((node) => ({
  //   data: { id: node.id, name: node.name, type: node.type },
  // }));
    // .filter(
    //   (node) =>
    //     node.type !== "type_identifier" 
    //   || !nodes["class_declaration"].find((e) => e.name == node.name)
    // )
  // const cyEdges = descendantsTree
  //   .filter((node) => node.parent !== null)
  //   .map((node) => mapNodeToData(node, nodes,types,tree));
  const cyData2 = [...cyNodes, ...cyEdges];
// log(descendantsTree)
// log(cyData2)
// log(nodes)
  return cyData2;
}
// const types = [
//   "class_declaration",
//   // "constructor_declaration",
//   // "method_declaration",
//   // "field_declaration",
//   // "local_variable_declaration",
//   "type_identifier",
// ];
// export const cyData= processSourceCode(projectTree);
// export function getData(types) {
//   return processSourceCode(projectTree,types);
// }
export function getData2(sourceCode,types) {
  const tree = parser.parse(sourceCode,null,{ bufferSize: 11511055, includedRanges: null})
  log('tree ok')
  const graph = getGraph(tree,types)
  log('graph ok')
  // log(graph)
  // log(graph.getCytoscapeData())
  // log(processSourceCode(tree,types))
  return graph.getCytoscapeData()
  return processSourceCode(tree,types);
}
function parcoursDescTree(tree,nodes){
  const graph = graphParenChild(tree)
  // log(tree)
  for (const [key, node] of tree) {
    if(node.type == "type_identifier" && node.name == "MatricePleine"){
      const start = key
      const target = nodes["class_declaration"][node.name]
      // if(tree.get(node.parent).name=="calcul.Calcul" && node.name=="MatricePleine"){
      const keyParentId = tree.get(key)?.parent
      // log(key,node.name,tree.get(keyParentId)?.name)
      // log(target,tree.get(target)?.name)
      // log(hasPathDFS(graph, start, target))
      // }
      // log("STARTTT")
      // log(graph)
    }
    // if(node.type == "class_declaration"){
    //   const start = key
    //   const target = 'calcul'
    //   log(hasPathDFS(graph, start, target))
    // }
}
}

function graphParenChild(tree){
  const graph = new Map();
  for (let [key, value] of tree.entries()) {
    // log(key,value.parent)
    // log(value)
    if (!graph.has(key)) {
      graph.set(key, []);
    }
    if (!graph.has(value.parent)) {
      graph.set(value.parent, []);
    }
    if(value.parent) graph.get(key).push(value.parent);
    graph.get(value.parent).push(key);
  }
  // log(graph)
  return graph;
}
function hasPathDFS(graph, start, target, visited = new Set()) {
  // log(graph)
  if (start === target) return true;
  if (visited.has(start)) return false;
  visited.add(start);
  // log(visited)
  if (!graph.has(start)) return false;
  // log(graph.has(start))
  
  // log(graph.get(start))
  // log(graph.get(start))
  for (let neighbor of graph.get(start)) {
    // log(neighbor)
    if (hasPathDFS(graph, neighbor, target, visited)) {
      return true;
    }
  }
  return false;
}