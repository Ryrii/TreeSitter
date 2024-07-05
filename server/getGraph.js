import { log } from "console";
import * as qn from "./qualifiedName.js";
function hasPathDFS(graph, start, target, visited = new Set()) {
    if (start === target) return true;
    if (visited.has(start)) return false;
  
    visited.add(start);
  
    const neighbors = graph.getNeighbors(start);
    for (const neighbor of neighbors) {
      if (hasPathDFS(graph, neighbor, target, visited)) {
        return true;
      }
    }
    return false;
  }
class Graph {
    constructor() {
      this.nodes = {}; // Stocke les nœuds par ID
      this.edges = []; // Tableau d'arêtes
      this.packages = []
      this.classes = {}
      this.constructors = {}
    }
    addPackage(name){
        this.packages.push(name)
    }
    addClass(name,nodeId){
        if (!this.classes[name]) {
            this.classes[name] = [];
        }
        this.classes[name].push(nodeId)
    }
    addConstructor(name,nodeId){
        if (!this.constructors[name]) {
            this.constructors[name] = [];
        }
        this.constructors[name].push(nodeId)
    }
    getClasses(){
        return this.classes;
    }
    getClass(name){
        return this.classes[name];
    }
    getConstructor(name){
        if (!this) {
            console.error('Constructors object is undefined or not properly initialized.');
            return; // or handle the error as appropriate
        }
        return this.constructors[name];
    }
    getUsable(type){
        const usable = {
            classes: this.getClass.bind(this),
            constructors: this.getConstructor.bind(this)
        }
        return usable[type];
        // return usable[type];
    }
    getClassesFromNodes(){
        const classes = {}
        Object.entries(this.nodes).forEach((node, key) => {
            if (node[1].type == 'class_declaration') {
                classes[node[1].name] = node[0];
            }
        });
        return classes;
    }
    getNodes(){
        return this.nodes;
    }
    getNodeIds(){
        return Object.keys(this.nodes);
    }
    getEdges(){
        return this.edges;
    }
    isNode(id) {
      return this.nodes[id] !== undefined;
    }
    getNode(id) {
        return this.nodes[id];
        }
    addNode(id, data) {
      this.nodes[id] = { ...data, id };
    }
    getDeclarationClass(){
        return Object.values(this.nodes).filter(node => node.childType == 'class_declaration');
    }
    edgeExists(source, target,type) {
      return this.edges.some(edge => edge.source === source && edge.target === target && edge.classes === type);
    }
    addEdge(source, target,type) {
        !this.edgeExists(source, target,type) && this.edges.push({ source, target,classes:type });
      // Optionnel : Ajouter une arête inverse pour la navigation bidirectionnelle
    //   this.edges.push({ source: target, target: source });
    }
  
    // Trouve tous les voisins d'un nœud
    getNeighbors(id) {
        var neighbors = this.edges.filter(edge => edge.source == id).map(edge => edge.target);
        neighbors.push(...this.edges.filter(edge => edge.target == id).map(edge => edge.source))
        return neighbors;
    }
    getCytoscapeData() {
        this.addImportEdges()
        log("addImportEdges done")
        var nodes = Object.values(this.nodes).map(node => ({
            data: { id: node.id, name: node.name, type: node.type },
            }))
        var edges = Object.values(this.edges).map(node => ({
            data: { source: node.source, target: node.target },
            classes: node.classes,
            }))
        const initialTree = {nodes,edges} // c'est l'arbre initial de graph qui rest le meme jusqu'a la fin (on modifie nodes et egdes, et non pas this.nodes et this.edges)
        log("initialTree done")
        edges = edges.filter(edge => edge.classes != 'temp' && edge.classes != 'import')
        log("edges done")
        const classUses = Object.values(this.nodes).filter(node => node.type == 'type_identifier' );
        log("classUses done")
        const constructorUse = Object.values(this.nodes).filter(node => node.type == 'object_creation_expression' );
        log("constructorUse done")
        nodes = nodes.filter(node => node.data.type != 'type_identifier' && node.data.type != 'object_creation_expression')
        log("nodes done")
        this.addUseEdge(classUses,edges,'classes') 
        log("addUseEdge done")
        this.addUseEdge(constructorUse,edges,'constructors') 
        log("addUseEdge done")
        const finalTree = {nodes,edges}
        return {initialTree,finalTree}
    }
    addUseEdge(uses,edges,usable) {
        // log(uses)
        uses.forEach(use => {
            // log("use")
            const usableIdList = this.getUsable(usable)(use.name);
            if (usableIdList?.length == 1 ) {
                const usableId = usableIdList[0];
                if(!this.isNode(usableId) || !this.isNode(use.parentId)){
                }else{
                    if (hasPathDFS(this,use.id,usableId)) {
                        edges.push({
                        data: { source: use.parentId, target: usableId },
                        classes: 'use',
                        })
                    }else{
                        edges.push({
                            data: { source: use.parentId, target: usableId },
                            classes: 'useError',
                            })
                    }
                }
                
                
            }else if (usableIdList?.length > 1) {
                usableIdList.forEach(usableId => {
                    if(!this.isNode(usableId) || !this.isNode(use.parentId)){
                    } else{
                        if (hasPathDFS(this,use.id,usableId)) {
                            edges.push({
                                data: { source: use.parentId, target: usableId },
                                classes: 'ambiguousUsage',
                                })
                            }
                    }
                    
                })
            }
        })
    }
    addImportEdges(){
        Object.values(this.nodes).filter(node => node.imports?.length>0).map(node =>this.getPackagesfromImports(node,node.imports))

    }
    getPackagesfromImports(node,imports){
        var packages = this.packages;
        packages= packages.map(pckg => pckg+'.*')
        const classes = this.getClassesFromNodes();
        imports.forEach(importName => {
            if (packages.includes(importName)) {
                this.addEdge(node.id,importName.replace('.*', ''),'import')
            }
            else if(importName in classes){
                // log(node.id,classes[importName])
                this.addEdge(node.id,classes[importName],'import')

            }
        })
    }

  }
export function getGraph(ast,types) {
    const graph = new Graph();
    parcoursAst(ast.rootNode,graph,types);
    log('getGraph done')
    return graph;
}
function parcoursAst(node,graph,types,parent){
    const childrens = node.children;
    var pendingPackage = null;
    var imports = [];
    if(node.type == 'class_declaration'){
        graph.addClass(qn.getNodeName(node),node.id)
    }
    if(node.type == 'constructor_declaration'){
        graph.addConstructor(qn.getNodeName(node),node.id)
    }
    for (let i = 0; i < childrens.length; i++) {
        const child = childrens[i];
        const childId = child.id;
        const name = qn.getNodeName(child);
        var childType = child.type;
        var parentId = parent?.id;
        if (childType == "package_declaration") {
            // si on rencontre un package
            pendingPackage = name;
            }        
        if (childType == "import_declaration") {
            // si on rencontre un import
            imports.push(name);
        }
        var prefix =pendingPackage??graph.getNode(parent?.id)?.name
        prefix = childType != 'type_identifier'?prefix:''
        prefix = prefix?prefix+'.':''

        if (types.includes(childType) ){
            
            if (childType == "class_declaration") {
                // si il s'agit d'une classe et qu'on est dans un package
                if (pendingPackage) {
                    const packages = pendingPackage.split('.')
                    var prevPckg = null
                    packages.forEach((pckg) => {
                        var pckgName = prevPckg?prevPckg+'.'+pckg:pckg
                        graph.addNode(pckgName, { name: pckgName, type: "package_declaration", parentId: prevPckg })
                        prevPckg && graph.addEdge(prevPckg, pckgName, 'contain')
                        graph.addPackage(pckgName)
                        prevPckg = pckgName
                    })
                    graph.addNode(pendingPackage, { name: pendingPackage, type: "package_declaration", parentId: null })
                    parentId = pendingPackage;
                    // graph.addEdge(parentId, childId)
                }
                graph.addNode(childId, { name: prefix + name, type: childType, parentId: parentId ?? null, imports: imports })
                // graph.addEdge(pendingPackage,name)
                pendingPackage = null;
                imports = [];
            } else {
                graph.addNode(childId, { name: prefix + name, type: childType, parentId: parentId ?? null })
            }
            if (childType == 'type_identifier') {
                if (child.parent.type == 'object_creation_expression') {
                    childType = 'object_creation_expression'
                }
                parentId && graph.addEdge(parentId, childId, 'temp')
            } else {
                parentId && graph.addEdge(parentId, childId, 'contain')
            }
        }
        if (types.includes(node.type)) {
            // si le type du noeud est dans la liste des types
            parcoursAst(child, graph, types, node); // le noeud devient le parent lors du prochain appel
        } else {
            parcoursAst(child, graph, types, parent); // le parent reste le même
        }
    }
}