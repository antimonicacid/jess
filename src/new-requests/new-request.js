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
      this.request = {};
      this.request.headers = {
        "Content-Type": "application/json"
      };
      this.request.credentials = "same-origin";
      if (info.type.toLowerCase() !== "get") {
        this.request.body = info.data;
      }
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
      return await fetch(this.url, this.request);
    }
  };

  // src/new-requests/new-request.ts
  var vscode = acquireVsCodeApi();
  var requestForm = document.getElementById("requestForm");
  var saveRequest = document.getElementById("saveRequest");
  var formData = new FormData(requestForm);
  var newData = document.getElementById("data");
  var newUrl = document.getElementById("url");
  var newToken = document.getElementById("token");
  var newRequestType = formData.get("type")?.toString();
  var reqName = document.getElementById("name");
  var collectionName = document.getElementById("collection");
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const request = createRequest();
    const response = await request.send();
    console.log(response);
  });
  saveRequest.addEventListener("submit", (e) => {
    e.preventDefault();
    addRequestToCollection();
  });
  window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.command !== "loadRequestData") {
      return;
    }
    const reqToLoad = message.request;
    console.log("LOADING");
    console.log(reqToLoad);
    newData.value = reqToLoad.request?.body ?? "";
    newUrl.value = reqToLoad.url ?? "";
    reqName.value = reqToLoad.name ?? "";
    newToken.value = reqToLoad.token ?? "X";
    const reqType = reqToLoad.request?.method?.toLowerCase() ?? "get";
    const rb = document.getElementById(reqType);
    rb.checked = true;
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
