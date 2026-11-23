import * as vscode from 'vscode';
import { Collection } from './Collection';

export class SavedCollections {
    public static createDefaultCollection() {
        return [new Collection("default")];
    }

    public static fromJSON(collectionArray: Array<any>) {
        const newCollectionArray = collectionArray.map((collection) => Collection.fromJSON(collection));
        
        return newCollectionArray;
    }

    public static toJSON(collectionArray: Array<Collection>) {
        const newCollectionArray = collectionArray.map((collection) => collection.toJSON());

        return newCollectionArray;
    }

    public static indexOf(collectionArray: Array<Collection>, name: string) {
        for (let i = 0; i < collectionArray.length; i++ ) {
            if (collectionArray[i].name === name) { return i; }
        }

        return -1;
    }

}