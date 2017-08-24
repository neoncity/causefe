import { WebFetcher } from '@neoncity/common-js'


export class ApiGatewayWebFetcher implements WebFetcher {
    private static readonly _options: any = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'error',
        referrer: 'client',
        credentials: 'include'
    };

    private readonly _apiGatewayHost: string;

    constructor(apiGatewayHost: string) {
        this._apiGatewayHost = apiGatewayHost;
    }

    async fetch(uri: string, options: any): Promise<Response> {
        const gatewayOptions = (Object as any).assign({}, ApiGatewayWebFetcher._options);
        gatewayOptions.headers = { 'Content-Type': 'application/json' };
        gatewayOptions.body = JSON.stringify({
            uri: uri,
            options: options
        });

        return await fetch(`${this._apiGatewayHost}/real/api-gateway`, gatewayOptions);
    }
}
