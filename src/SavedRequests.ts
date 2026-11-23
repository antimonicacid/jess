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
            console.log("im up refreshing my collections");
            const collections = SavedCollections.fromJSON(this.eContext.globalState.get("jessSavedCollections")!);
            webviewView.webview.postMessage({ "command": "renderCollections", "data": collections });
        }));

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "src", "saved-requests")]
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

            html = html
                .replace(/{{scriptUri}}/g, scriptUri.toString())
                .replace(/{{cspSource}/g, webviewView.webview.cspSource)
                .replace(/{{numOnce}}/g, numOnce);

            webviewView.webview.html = html;
        };

        setHtmlContent();

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                //when the js file has loaded, render collections
                case "ready":
                    const collections = SavedCollections.fromJSON(this.eContext.globalState.get("jessSavedCollections")!);
                    webviewView.webview.postMessage({
                        "command": "renderCollections",
                        "data": collections
                    });
                case "loadRequest":
                    console.log(message);
                    NewRequest.show(this._extensionUri, this.eContext, message.request);
            }

        });

        

    };


};