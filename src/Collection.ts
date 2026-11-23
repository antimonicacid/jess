import { HTTPRequest } from "./Request";

export class Collection {
    name: string;
    requests: Map<string, HTTPRequest>;
    
    constructor(name: string, requests?: Map<string, HTTPRequest>) {
        this.name = name;
        this.requests = requests ?? new Map();
    };

    public addRequest(request: HTTPRequest): void {
        this.requests.set(request.name, request);
    };

    public getRequest(name: string): HTTPRequest | undefined {
        return this.requests.get(name);
    }

    public deleteRequest(name: string): boolean {
        return this.requests.delete(name);
    }

    public toJSON() {
        return {
            name: this.name, 
            requests: Object.fromEntries(this.requests)
        };
    }

    static fromJSON(obj: { name: string; requests: Map<string, HTTPRequest>; }) {
        return new Collection(obj.name, new Map(Object.entries(obj.requests)));
    }
}