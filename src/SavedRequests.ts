import * as vscode from 'vscode';
import { Collection } from './Collection';
import { NumberUsedOnce } from './NumberUsedOnce';
import { SavedCollections } from './SavedCollections';
import { NewRequest } from './NewRequest';

export class SavedRequests implements vscode.WebviewViewProvider {
    eContext: vscode.ExtensionContext;
    _extensionUri: vscode.Uri;

    constructor (eContext: vscode.ExtensionContext) {
        this.eContext = eContext;
        this._extensionUri = eContext.extensionUri;

        console.log(eContext.globalState.get("jessSavedCollections"));

    }

    public resolveWebviewView = async (
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) => {

        this.eContext.subscriptions.push(vscode.commands.registerCommand("jess.refreshCollections", () => {
            const collections = SavedCollections.fromJSON(this.eContext.globalState.get("jessSavedCollections")!);
            webviewView.webview.postMessage({ "command": "renderCollections", "data": collections });
        }));

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, "src", "saved-requests"),
                vscode.Uri.joinPath(this._extensionUri, "media")
            ]
        };

        const scriptUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src", "saved-requests", "saved-requests-sidebar.js")
        );

        const setHtmlContent = async (): Promise<void> => {       
            //fetch html file     
            const htmlUri: vscode.Uri = vscode.Uri.joinPath(this._extensionUri, "src", "saved-requests", "saved-requests.html");
            const bytes = await vscode.workspace.fs.readFile(htmlUri);
            let html = new TextDecoder("utf-8").decode(bytes);
    
            const numOnce = NumberUsedOnce.generate();
            const deleteIconSource = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "delete.png"));

            html = html
                .replace(/{{scriptUri}}/g, scriptUri.toString())
                .replace(/{{cspSource}/g, webviewView.webview.cspSource)
                .replace(/{{numOnce}}/g, numOnce)
                .replace(/{{deleteIconSource}}/g, deleteIconSource.toString());

            webviewView.webview.html = html;
        };

        setHtmlContent();

        webviewView.webview.onDidReceiveMessage(async (message) => {
            let collections = SavedCollections.fromJSON(this.eContext.globalState.get("jessSavedCollections")!);
            switch (message.command) {
                //when the js file has loaded, render collections
                case "ready": {
                    webviewView.webview.postMessage({
                        "command": "renderCollections",
                        "data": collections
                    });
                    break;
                }

                case "loadRequest": {
                    console.log(message);
                    NewRequest.showWithRequest(this._extensionUri, this.eContext, message.request);
                    break;
                }

                case "deleteCollection": {
                    const index = SavedCollections.indexOf(collections, message.collection);
                    if (index === -1) { return; }

                    collections.splice(index, 1);
                    await this.eContext.globalState.update("jessSavedCollections", collections);
                    
                    webviewView.webview.postMessage({
                        "command": "renderCollections",
                        "data": collections
                    });
                    break;
                }


                case "deleteRequest": {
                    console.log(collections, message.collection);
                    const index = SavedCollections.indexOf(collections, message.collection);
                    console.log(index);
                    collections[index].deleteRequest(message.request);
                    await this.eContext.globalState.update("jessSavedCollections", collections);

                    webviewView.webview.postMessage({
                        "command": "renderCollections",
                        "data": collections
                    });
                    break;                    
                }

            }

        });

        

    };


};