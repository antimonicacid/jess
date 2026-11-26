"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/Request.ts
  var HTTPRequest = class {
    constructor(name, info) {
      __publicField(this, "request");
      __publicField(this, "url");
      __publicField(this, "name");
      __publicField(this, "token");
      __publicField(this, "cookies");
      this.request = {};
      this.request.headers = {
        "Content-Type": "application/json"
      };
      this.request.credentials = "same-origin";
      this.request.body = info.data;
      if (info.token) {
        this.token = info.token;
        this.request.headers.Authorization = `Bearer ${info.token}`;
      }
      if (info.cookies) {
        this.request.headers.cookie = info.cookies;
      }
      this.url = info.url;
      this.name = name;
      this.request.method = info.type;
    }
    async send() {
    }
    setCookies(response) {
      const cookies = response.headers.getSetCookie();
      this.cookies = cookies;
    }
  };

  // src/new-requests/new-request.ts
  var vscode = acquireVsCodeApi();
  var requestForm = document.getElementById("requestForm");
  var saveRequest = document.getElementById("saveRequest");
  var newData = document.getElementById("data");
  var newUrl = document.getElementById("url");
  var newToken = document.getElementById("token");
  var reqName = document.getElementById("name");
  var collectionName = document.getElementById("collection");
  var result = document.getElementById("result");
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const request = createRequest();
    vscode.postMessage({
      "command": "sendRequest",
      "url": newUrl.value,
      "request": request
    });
  });
  saveRequest.addEventListener("submit", (e) => {
    e.preventDefault();
    addRequestToCollection();
  });
  window.addEventListener("message", async (e) => {
    const message = e.data;
    switch (message.command) {
      case "loadRequestData": {
        const reqToLoad = message.request;
        const formData = new FormData(requestForm);
        console.log("LOADING");
        console.log(message.collection);
        newData.value = reqToLoad.request?.body ?? "";
        newUrl.value = reqToLoad.url ?? "";
        reqName.value = reqToLoad.name ?? "";
        newToken.value = reqToLoad.token ?? "";
        collectionName.value = message.collection ?? "";
        formData.set("type", reqToLoad.request?.method?.toLowerCase() ?? "get");
        break;
      }
      case "updateResponseDiv": {
        console.log("yo");
        console.log(message);
        console.log(message.response);
        if (!result) {
          return;
        }
        result.innerHTML = `${message.status} ${message.statusText} 
${JSON.stringify(message.json)}`;
      }
    }
  });
  var addRequestToCollection = () => {
    const request = createRequest();
    vscode.postMessage({
      "command": "addRequestToCollection",
      "request": request,
      "collection": collectionName.value ?? "default"
    });
  };
  var createRequest = () => {
    const formData = new FormData(requestForm);
    const newRequestType = formData.get("type")?.toString();
    console.log("creating request");
    console.log(newData.value);
    const info = {
      type: newRequestType,
      url: newUrl.value,
      data: newData.value ?? void 0,
      token: newToken.value ?? void 0,
      cookies: void 0
    };
    const request = new HTTPRequest(reqName.value, info);
    return request;
  };
  vscode.postMessage({ command: "ready" });
})();
