import { updateGraph, editor, editorSetValue } from "./index.js";

await fetch("data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.data);
    updateGraph(data.data);
    editorSetValue(data.sourceCode);
  })
  .catch((error) => console.error("Erreur:", error));

window.getDataTypes = async function getDataTypes() {
  console.log("sending code to server");
  const sourceCode = editor.getValue();
  const form = document.getElementById('typeForm');
  const types = Array.from(form.elements.type)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const response = await fetch("data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceCode,types }),
  });
  const data = await response.json();
  console.log(data.data);
  updateGraph(data.data);
}
