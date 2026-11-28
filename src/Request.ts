export type HTTPRequestInfo = {
    type: string,
    url: string,
    data: string | undefined,
    token: string | undefined,
    cookies: Array<string> | undefined,
    auth?: string | undefined
}

export class HTTPRequest {
    request: RequestInit;
    url: string;
    name: string;
    token: string | undefined;
    body: string | undefined; //save body from form anyway, even if it may not be used (e.g. get request)
    cookies: Array<string> | undefined;
    

    constructor (name: string, info: HTTPRequestInfo) {
        this.request = {};
        this.request.headers = {
            'Content-Type': 'application/json'
        };
        this.request.credentials = 'same-origin';
        this.body = info.data;
        if (info.type !== "get") { this.request.body = info.data; }
        if (info.token) {
            this.token = info.token; 
            this.request.headers.Authorization = `Bearer ${info.token}`; 
        }
        
        this.url = info.url;
        this.name = name;
        this.request.method = info.type;

        const cookieHeader = info.cookies?.map((c) => c.split(";")[0]).join("; ");
        if (cookieHeader) { this.request.headers.Cookie = cookieHeader; }
    } 

    public setCookies(response: Response) {
        const cookies = response.headers.getSetCookie();
        this.cookies = cookies;
    }

}