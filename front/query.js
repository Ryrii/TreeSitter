import { updateGraph, editor, editorSetValue } from "./index.js";

await fetch("http://localhost:3030/data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    updateGraph(data.data);
    editorSetValue(data.sourceCode);
  })
  .catch((error) => console.error("Erreur:", error));

window.sendCode = async function sendCode() {
  console.log("sending code to server");
  const sourceCode = editor.getValue();
  const response = await fetch("http://localhost:3030/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceCode }),
  });
  const tree = await response.json();
  console.log(tree);
  updateGraph(tree);
};
