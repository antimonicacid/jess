import * as vscode from 'vscode';
import { Collection } from './Collection';
import { SavedCollections } from './SavedCollections';
import { NumberUsedOnce } from './NumberUsedOnce';
import { HTTPRequest } from './Request';

export class NewRequest {
    private readonly disposables: vscode.Disposable[] = [];
    

    private constructor(private readonly panel: vscode.WebviewPanel, private readonly extensionUri: vscode.Uri, private readonly context: vscode.ExtensionContext, request?: HTTPRequest) {
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command !== "addRequestToCollection") { return; }
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
        }, null, this.disposables);
    }

    public static async show(extensionUri: vscode.Uri, context: vscode.ExtensionContext, request?: HTTPRequest) {
        const panel = vscode.window.createWebviewPanel(
            "apiRequest",
            "Make a new request",
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, "src", "new-requests")]
            }
        );

        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                //when the js file has loaded, render collections
                case "ready":
                    panel.webview.postMessage({
                        "command": "loadRequestData",
                        "request": request
                    });
            }
        });

        const instance = new this(panel, extensionUri, context, request);
        await instance.update();
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