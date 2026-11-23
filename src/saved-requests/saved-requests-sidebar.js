"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/Collection.ts
  var Collection = class _Collection {
    constructor(name, requests) {
      __publicField(this, "name");
      __publicField(this, "requests");
      this.name = name;
      this.requests = requests ?? /* @__PURE__ */ new Map();
    }
    addRequest(request) {
      this.requests.set(request.name, request);
    }
    getRequest(name) {
      return this.requests.get(name);
    }
    deleteRequest(name) {
      return this.requests.delete(name);
    }
    toJSON() {
      return {
        name: this.name,
        requests: Object.fromEntries(this.requests)
      };
    }
    static fromJSON(obj) {
      return new _Collection(obj.name, new Map(Object.entries(obj.requests)));
    }
  };

  // src/SavedCollections.ts
  var SavedCollections = class {
    static createDefaultCollection() {
      return [new Collection("default")];
    }
    static fromJSON(collectionArray) {
      const newCollectionArray = collectionArray.map((collection) => Collection.fromJSON(collection));
      return newCollectionArray;
    }
    static toJSON(collectionArray) {
      const newCollectionArray = collectionArray.map((collection) => collection.toJSON());
      return newCollectionArray;
    }
    static indexOf(collectionArray, name) {
      for (let i = 0; i < collectionArray.length; i++) {
        if (collectionArray[i].name === name) {
          return i;
        }
      }
      return -1;
    }
  };

  // src/saved-requests/saved-requests-sidebar.ts
  var vscode = acquireVsCodeApi();
  var btn = document.getElementById("action-btn");
  var collections = document.getElementById("collections");
  var loaded = false;
  btn?.addEventListener("click", (e) => vscode.postMessage({
    command: "clearRequests"
  }));
  window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.command !== "renderCollections") {
      return;
    }
    if (loaded && collections) {
      collections.innerHTML = "";
    }
    const data = SavedCollections.fromJSON(message.data);
    for (const collection of data) {
      const newCollection = document.createElement("ul");
      const newCollectionText = document.createTextNode(collection.name);
      newCollection.appendChild(newCollectionText);
      collection.requests.forEach((req, name) => {
        const newRequest = document.createElement("li");
        newRequest.innerHTML = name;
        newRequest.addEventListener("click", (e2) => {
          console.log("hey");
          vscode.postMessage({
            command: "loadRequest",
            request: req
          });
        });
        newCollection.appendChild(newRequest);
      });
      collections?.append(newCollectionText);
      collections?.append(newCollection);
    }
    loaded = true;
  });
  vscode.postMessage({ command: "ready" });
})();
