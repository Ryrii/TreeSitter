import { log } from 'console';
import fs from 'fs';
import path from 'path';
import Parser from 'tree-sitter';
import Java from "tree-sitter-java";
import util from 'util';

// Créez une instance du parseur
const parser = new Parser();
parser.setLanguage(Java);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

// export let projectTree = {};
const directoryPath = path.join(process.cwd(), 'matrices');

async function readFiles(directory,projectSourceCode) {
    try {
        const files = await readdir(directory);
        for (const file of files) {
            const fullPath = path.join(directory, file);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                await readFiles(fullPath,projectSourceCode);
            } else if (path.extname(file) === '.java') {
                const sourceCode = await readFile(fullPath, 'utf8');
                // const tree = parser.parse(sourceCode,null,{ bufferSize: 900000, includedRanges: null});
                // projectSourceCode += sourceCode;
                // log(projectSourceCode.length);
                if (projectSourceCode.length<100 )//1635
                    projectSourceCode.push(sourceCode);
            }
        }
    } catch (err) {
        console.log('Error reading directory:', err);
    }
}
// log("start");
async function initializeProjectTree() {
    let projectSourceCode = "";
    let projectTree = [];
    await readFiles(directoryPath,projectTree);
    projectTree.map((sourceCode) => {
        projectSourceCode += sourceCode;
    })
    log(projectSourceCode.length);
    const tree =  parser.parse(projectSourceCode,null,{ bufferSize: 11511049, includedRanges: null});
    // log(tree.rootNode);
    return tree;
    // return projectTree['/Users/ryrii/Desktop/Stage LIP6/localTreeSitter/argo/src/argouml-core-umlpropertypanels/src/org/argouml/core/propertypanels/ui/XmlPropertyPanel.java'];
}  // `projectTree` sera maintenant modifié avec les arbres
export const projectTree = await initializeProjectTree();

export async function getSourceCode() {
    let projectSourceCode = "";
    let projectTree = [];
    await readFiles(directoryPath,projectTree);
    projectTree.map((sourceCode) => {
        projectSourceCode += sourceCode;
    })
    // log(projectSourceCode);
    return projectSourceCode;
    // return projectTree['/Users/ryrii/Desktop/Stage LIP6/localTreeSitter/argo/src/argouml-core-umlpropertypanels/src/org/argouml/core/propertypanels/ui/XmlPropertyPanel.java'];
} 
export const argoSourceCode = await getSourceCode();

// log(projectTree);
// const rootnode = projectTree.rootNode;
// log(rootnode.descendantsOfType('class_declaration')[0].text);
// import "./parseTest.js"