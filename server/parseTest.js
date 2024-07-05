import Parser from "tree-sitter";
import Java from "tree-sitter-java";
import fs from "fs";
import { log } from "console";
import util from "util";
const readFile = util.promisify(fs.readFile);
const parser = new Parser();
parser.setLanguage(Java);
const filePath =
  "/Users/ryrii/Desktop/Stage LIP6/localTreeSitter/argo/src/argouml-app/src/org/argouml/kernel/ProjectImpl.java";
const sourceCode = await readFile(filePath, "utf8");
const sourceCode2 = `
            package hi;
            public class Calcul {
                // sous ce seuil la matrice devrait etre creuse
                private static final double seuilCreuse = 0.2;

                private boolean creuse;
                private MatriceCreuse mc;
                private MatricePleine mp;

                public Calcul(int hauteur, int largeur) {
                    creuse = true;
                    mc = new MatriceCreuse(hauteur, largeur);
                    mp = null;
                }
            }`;

const sourceCode3 = `
            package hza;
            public class arfz {
                // sous ce seuil la matrice devrait etre creuse
                private static final double seuilCreuse = 0.2;

                private int creafzuse;

                public arfz(int hauteur, int largeur) {
                }

                public void frazf(int hauteur, int largeur) {
                }
            }`;

// Concaténer sourceCode3 et sourceCode2
const combinedSource = sourceCode3 + "\n\n" + sourceCode2;

// Analyser le texte combiné et obtenir un arbre syntaxique
export const treeTest = parser.parse(sourceCode3);
export const treeTest2 = parser.parse(combinedSource, treeTest, { bufferSize: null, includedRanges: { start: 0, end: 394 } });

// console.log(treeTest2.rootNode.text);
// log(sourceCode3.length);

//,null,{bufferSize: 34541,includedRanges:null}
