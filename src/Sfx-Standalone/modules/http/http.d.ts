//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "sfx.module-manager" {
    import {
        IHttpClient,
        IHttpClientBuilder,
        RequestAsyncProcessor,
        ResponseAsyncHandler
    } from "sfx.http";
    import { IHandlerConstructor } from "sfx.common";

    export interface IModuleManager {
        getComponentAsync(componentIdentity: "http.http-client"): Promise<IHttpClient>;
        getComponentAsync(componentIdentity: "http.https-client"): Promise<IHttpClient>;

        getComponentAsync(componentIdentity: "http.node-http-client"): Promise<IHttpClient>;
        getComponentAsync(componentIdentity: "http.node-https-client"): Promise<IHttpClient>;

        getComponentAsync(componentIdentity: "http.electron-http-client"): Promise<IHttpClient>;
        getComponentAsync(componentIdentity: "http.electron-https-client"): Promise<IHttpClient>;

        getComponentAsync(componentIdentity: "http.client-builder"): Promise<IHttpClientBuilder>;
        getComponentAsync(componentIdentity: "http.node-client-builder"): Promise<IHttpClientBuilder>;
        getComponentAsync(componentIdentity: "http.electron-client-builder"): Promise<IHttpClientBuilder>;

        getComponentAsync(componentIdentity: "http.request-handlers.handle-json"): Promise<IHandlerConstructor<RequestAsyncProcessor>>;

        getComponentAsync(componentIdentity: "http.response-handlers.handle-redirection"): Promise<IHandlerConstructor<ResponseAsyncHandler>>;
        getComponentAsync(componentIdentity: "http.response-handlers.handle-json"): Promise<IHandlerConstructor<ResponseAsyncHandler>>;

        getComponentAsync(componentIdentity: "http.response-handlers.handle-auth-cert"): Promise<IHandlerConstructor<ResponseAsyncHandler>>;
        getComponentAsync(componentIdentity: "http.response-handlers.handle-auth-aad"): Promise<IHandlerConstructor<ResponseAsyncHandler>>;
        getComponentAsync(componentIdentity: "http.response-handlers.handle-auth-dsts"): Promise<IHandlerConstructor<ResponseAsyncHandler>>;
    }
}

declare module "sfx.http" {
    import { IDictionary, IHandlerConstructor } from "sfx.common";
    import { IncomingMessage, ClientRequest, Server } from "http";
    import { ILog } from "sfx.logging";
    import { ICertificateInfo, ICertificate } from "sfx.cert";

    export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

    export interface IHttpClientBuilder {
        handleRequest(constructor: IHandlerConstructor<RequestAsyncProcessor>): IHttpClientBuilder;
        handleResponse(constructor: IHandlerConstructor<ResponseAsyncHandler>): IHttpClientBuilder;
        build(protocol: string): IHttpClient;
    }

    export interface RequestAsyncProcessor {
        (client: IHttpClient, log: ILog, requestOptions: IRequestOptions, requestData: any, request: ClientRequest): Promise<void>;
    }

    export interface ResponseAsyncHandler {
        (client: IHttpClient, log: ILog, requestOptions: IRequestOptions, requestData: any, response: IncomingMessage): Promise<any>;
    }

    export interface ServerCertValidator {
        (serverName: string, cert: ICertificateInfo): Error | void;
    }

    export type SslProtocol = "TLS" | "TLS1.2" | "TLS1.1" | "TLS1.0" | "SSL3.0";

    export interface IRequestOptions {
        method: HttpMethod;
        url: string;
        headers?: IDictionary<string | Array<string>>;
        serverCertValidator?: ServerCertValidator;
        clientCert?: ICertificate;
        sslProtocol?: SslProtocol;
    }

    export interface IHttpClient {
        readonly defaultRequestOptions: IRequestOptions;

        updateDefaultRequestOptions(options: IRequestOptions): void;

        deleteAsync(url: string): Promise<IncomingMessage | any>;

        getAsync(url: string): Promise<IncomingMessage | any>;

        patchAsync(url: string, data: any): Promise<IncomingMessage | any>;

        postAsync(url: string, data: any): Promise<IncomingMessage | any>;

        putAsync(url: string, data: any): Promise<IncomingMessage | any>;

        requestAsync(requestOptions: IRequestOptions, data: any): Promise<IncomingMessage | any>;
    }
}

declare module "sfx.http.auth" {
    import { ICertificateInfo, ICertificate } from "sfx.cert";

    export interface SelectClientCertAsyncHandler {
        (url: string, certInfos: Array<ICertificateInfo>): Promise<ICertificate | ICertificateInfo>;
    }
}