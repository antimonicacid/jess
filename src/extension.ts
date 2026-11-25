import * as vscode from 'vscode';
import { SavedRequests } from './SavedRequests';
import { NewRequest } from './NewRequest';

export function activate(context: vscode.ExtensionContext) {
	//new request window
	context.subscriptions.push(
		vscode.commands.registerCommand("jess.openWindow", async () => {
			NewRequest.show(context.extensionUri, context);
		})
	);


	//saved requests sidebar
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(
		'jess-saved-requests',
		new SavedRequests(context)
	));
}