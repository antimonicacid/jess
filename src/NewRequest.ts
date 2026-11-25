import * as vscode from 'vscode';
import { Collection } from './Collection';
import { SavedCollections } from './SavedCollections';
import { NumberUsedOnce } from './NumberUsedOnce';
import { HTTPRequest } from './Request';

export class NewRequest {
    private readonly disposables: vscode.Disposable[] = [];
    panel: vscode.WebviewPanel;
    

    private constructor(panel: vscode.WebviewPanel, private readonly extensionUri: vscode.Uri, private readonly context: vscode.ExtensionContext) {
        this.panel = panel;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "addRequestToCollection": {
                    const collection = message.collection;
                    const request = message.request;
                    const context = this.context;
                    

                    const savedCollections: Array<Collection> = context.globalState.get("jessSavedCollections") ?? [];
                    let c: Array<Collection> = SavedCollections.fromJSON(savedCollections);

                    const index = SavedCollections.indexOf(c, collection);

                    if (index === -1) {
                        const newCol = new Collection(collection);
                        newCol.addRequest(request);
                        c.push(newCol);
                    } else {
                        c[index]?.addRequest(request);
                    }

                    const nc = SavedCollections.toJSON(c);
                    await context.globalState.update("jessSavedCollections", nc);

                    vscode.commands.executeCommand("jess.refreshCollections");
                    break;
                }
                case "sendRequest": {
                    console.log("im about to send (from newrequest.ts)");
                    console.log(message.request.request);
                    const response = await fetch(message.url, message.request.request); //wow
                    let json;
                    try {
                        json = await response.json();
                    } catch (err) {
                        console.log(err);
                    }
                    console.log(response);
                    panel.webview.postMessage({
                        "command": "updateResponseDiv",
                        "status": response.status,
                        "statusText": response.statusText,
                        "json": json ?? ""
                    });
                }
                
            }

        }, null, this.disposables);
    }

    public static async show(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        const panel = vscode.window.createWebviewPanel(
            "apiRequest",
            "Make a new request",
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, "src", "new-requests")]
            }
        );

        const instance = new this(panel, extensionUri, context);
        await instance.update();

        return instance;
    }

    public static async showWithRequest(extensionUri: vscode.Uri, context: vscode.ExtensionContext, request: HTTPRequest) {
        vscode.commands.executeCommand("jess.openWindow");
        const instance = await this.show(extensionUri, context);
        instance.panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                //when the js file has loaded, render collections
                case "ready":
                    instance.panel.webview.postMessage({
                        "command": "loadRequestData",
                        "request": request
                    });
            }
        });
    }

    public dispose() {
        this.panel.dispose();
        while (this.disposables.length > 0) {
            this.disposables.pop()?.dispose();
        }
    }

    public async update() {
        this.panel.webview.html = await this.getHtml(this.panel.webview);
    }

    public async getHtml(webview: vscode.Webview): Promise<string> {
        const folder = vscode.Uri.joinPath(this.extensionUri, "src", "new-requests");
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(folder, "style.css"));
        const htmlUri = vscode.Uri.joinPath(folder, "new-request.html");
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(folder, "new-request.js"));
    
        const bytes = await vscode.workspace.fs.readFile(htmlUri);
        let html = new TextDecoder("utf-8").decode(bytes);
    
        const numOnce = NumberUsedOnce.generate();
    
        html = html
            .replace(/{{cspSource}}/g, webview.cspSource)
            .replace(/{{styleUri}}/g, styleUri.toString())
            .replace(/{{scriptUri}}/g, scriptUri.toString())
            .replace(/{{numOnce}}/g, numOnce);
        
        return html; 
    }
}