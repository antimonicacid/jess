export type HTTPRequestInfo = {
    type: string,
    url: string,
    data: string | undefined,
    token: string | undefined,
    cookies: string | undefined,
    auth?: string | undefined
}

export class HTTPRequest {
    request: RequestInit;
    url: string;
    name: string;
    token: string | undefined;

    constructor (name: string, info: HTTPRequestInfo) {
        this.request = {};
        this.request.headers = {
            'Content-Type': 'application/json'
        };
        this.request.credentials = 'same-origin';
        if (info.type.toLowerCase() !== "get") { this.request.body = info.data; }
        if (info.token) {
            this.token = info.token; 
            this.request.headers.Authorization = `Bearer ${info.token}`; 
        }
        if (info.cookies) { this.request.headers.cookie = info.cookies; }
        this.url = info.url;
        this.name = name;
        this.request.method = info.type;
    }

    public async send(): Promise<Response> {
        return await fetch(this.url, this.request);
    }

}