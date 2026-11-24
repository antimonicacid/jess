import { Collection } from "../Collection";
import { SavedCollections } from "../SavedCollections";

const vscode = acquireVsCodeApi();

const btn = document.getElementById("action-btn");
const collections = document.getElementById("collections");

let loaded = false;

btn?.addEventListener("click", (e) => vscode.postMessage({
    command: "clearRequests"
}));


// fetch requests from global state and render them
window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.command !== "renderCollections") { return; }
    if (loaded && collections) { collections.innerHTML = ""; }
    
    const data = SavedCollections.fromJSON(message.data);

    for (const collection of data) {
        const newCollection = document.createElement("ul");
        const newCollectionText = document.createTextNode(collection.name);

        const newCollectionClearButton = document.createElement("button");
        newCollectionClearButton.innerHTML = "Delete Collection";

        newCollectionClearButton.addEventListener("click", (e) => {
            console.log("they done pressed me");
            vscode.postMessage({
                "command": "deleteCollection",
                "collection": collection.name
            });
        });

        newCollection.appendChild(newCollectionText);
        newCollection.appendChild(newCollectionClearButton);

        collection.requests.forEach((req, name) => {
            const newRequest = document.createElement("li");
            newRequest.innerHTML = name;

            const newRequestDeleteButton = document.createElement("button");
            newRequestDeleteButton.innerHTML = "Delete";

            newRequestDeleteButton.addEventListener("click", (e) => {
                vscode.postMessage({
                    command: "deleteRequest",
                    request: req.name,
                    collection: collection.name
                });
            });

            newRequest.addEventListener("click", (e) => {
                vscode.postMessage({
                    command: "loadRequest",
                    request: req
                });
            });

            newCollection.appendChild(newRequest);
            newCollection.appendChild(newRequestDeleteButton);
        });

        collections?.append(newCollectionText);
        collections?.append(newCollection);
    }

    loaded = true;
});

vscode.postMessage({ command: "ready" });