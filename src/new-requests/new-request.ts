const vscode = acquireVsCodeApi();

import { HTTPRequest, HTTPRequestInfo } from '../Request';

const requestForm = document.getElementById("requestForm");
const saveRequest = document.getElementById("saveRequest");


const formData = new FormData(requestForm as HTMLFormElement);
const newData = (document.getElementById('data') as HTMLFormElement);
const newUrl = (document.getElementById('url') as HTMLFormElement);
const newToken = (document.getElementById('token') as HTMLFormElement);
const newRequestType = formData.get('type')?.toString();
const reqName = (document.getElementById('name') as HTMLFormElement);
const collectionName = (document.getElementById('collection') as HTMLFormElement);

requestForm!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const request: HTTPRequest = createRequest();

    const response = await request.send();
    console.log(response);
});

saveRequest!.addEventListener("submit", (e) => {
    e.preventDefault();
    addRequestToCollection();
});

window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.command !== "loadRequestData") { return; }
    const reqToLoad: HTTPRequest = message.request;

    console.log("LOADING");
    console.log(reqToLoad);

    newData.value = reqToLoad.request?.body ?? "";
    newUrl.value = reqToLoad.url ?? "";
    reqName.value = reqToLoad.name ?? "";

    newToken.value = reqToLoad.token ?? "";

    const reqType = reqToLoad.request?.method?.toLowerCase() ?? "get";
    const rb = document.getElementById(reqType) as HTMLInputElement;
    rb.checked = true;
});


const addRequestToCollection = () => {
    const request = createRequest();
    vscode.postMessage({
        "command": "addRequestToCollection",
        "request": request,
        "collection": collectionName.value ?? "default"
    });
};

const createRequest = () => {
    const info: HTTPRequestInfo = {
        type: newRequestType!,
        url: newUrl.value,
        data: newData.value ?? undefined,
        token: newToken.value ?? undefined,
        cookies: undefined
    };

    const request = new HTTPRequest(reqName.value, info);
    return request;

};



vscode.postMessage({ command: "ready" });