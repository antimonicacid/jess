const vscode = acquireVsCodeApi();

import { HTTPRequest, HTTPRequestInfo } from '../Request';

const requestForm = document.getElementById("requestForm");
const saveRequest = document.getElementById("saveRequest");

const newData = (document.getElementById('data') as HTMLFormElement);
const newUrl = (document.getElementById('url') as HTMLFormElement);
const newToken = (document.getElementById('token') as HTMLFormElement);
const reqName = (document.getElementById('name') as HTMLFormElement);
const collectionName = (document.getElementById('collection') as HTMLFormElement);

const result = document.getElementById('result');

requestForm!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const request: HTTPRequest = createRequest();

    vscode.postMessage({
        "command": "sendRequest",
        "url": newUrl.value,
        "request": request
    });

    
});

saveRequest!.addEventListener("submit", (e) => {
    e.preventDefault();
    addRequestToCollection();
});

window.addEventListener("message", async (e) => {
    const message = e.data;
    switch (message.command) {
        case "loadRequestData": {
            const reqToLoad: HTTPRequest = message.request;
            const formData = new FormData(requestForm as HTMLFormElement);

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
            //message.status, message.statuasText, message.json (for now)
            if (!result) { return; }
            result.innerHTML = `${message.status} ${message.statusText} \n${JSON.stringify(message.json)}`;
        }
    }

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
    const formData = new FormData(requestForm as HTMLFormElement);
    const newRequestType = formData.get('type')?.toString(); 
    console.log("creating request");
    console.log(newData.value);
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