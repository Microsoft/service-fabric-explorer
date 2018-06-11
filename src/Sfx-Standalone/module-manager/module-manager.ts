//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import {
    IModuleInfo,
    IModuleManager,
    IComponentInfo,
    HostVersionMismatchEventHandler,
    IDisposable
} from "sfx";

import { ICommunicator, RequestHandler, IRoutePattern } from "sfx.remoting";
import { IObjectRemotingProxy, Resolver } from "sfx.proxy.object";

import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import * as semver from "semver";

import * as utils from "../utilities/utils";
import * as di from "../utilities/di";
import * as diExt from "../utilities/di.ext";
import { NodeCommunicator } from "../modules/ipc/communicator.node";
import { ObjectRemotingProxy } from "../modules/proxy.object/proxy.object";
import StringPattern from "../modules/remoting/pattern/string";
import * as mmutils from "./utils";

enum ModuleManagerAction {
    loadModuleAsync = "loadModuleAsync",
    loadModuleDirAsync = "loadModuleDirAsync"
}

interface IModule {
    getModuleMetadata?(): IModuleInfo;
    initialize?(moduleManager: IModuleManager): void;
}

interface IHostRecord {
    process: child_process.ChildProcess;
    proxy: IObjectRemotingProxy;
    communicator: ICommunicator;
}

interface IModuleManagerMessage {
    action: ModuleManagerAction;
    content: any;
}

interface ILoadModuleAsyncMessage extends IModuleManagerMessage {
    action: ModuleManagerAction.loadModuleAsync;
    content: string;
}

interface ILoadModuleDirAsyncMessage extends IModuleManagerMessage {
    action: ModuleManagerAction.loadModuleDirAsync;
    content: string;
}

export class ModuleManager implements IModuleManager {
    private readonly _hostVersion: string;

    private readonly pattern_moduleManager: IRoutePattern;

    private readonly pattern_proxy: IRoutePattern;

    private hostVersionMismatchHandler: HostVersionMismatchEventHandler;

    private children: Array<IHostRecord>;

    private parentProxy: IObjectRemotingProxy;

    private container: di.IDiContainer;

    private modulePaths: Array<string>;

    public get hostVersion(): string {
        return this._hostVersion;
    }

    public get loadedModules(): Array<string> {
        return this.modulePaths.slice();
    }

    constructor(
        hostVersion: string,
        parentCommunicator?: ICommunicator) {
        if (!semver.valid(hostVersion)) {
            throw new Error(`Invalid hostVersion "${hostVersion}".`);
        }

        this._hostVersion = hostVersion;
        this.pattern_moduleManager = new StringPattern("module-manager");
        this.pattern_proxy = new StringPattern("module-manager/object-proxy");
        this.modulePaths = [];
        this.container = new di.DiContainer();

        if (parentCommunicator) {
            this.parentProxy = ObjectRemotingProxy.create(this.pattern_proxy, parentCommunicator, true);
            this.parentProxy.setResolver(this.onProxyResolvingAsync);
            parentCommunicator.map(this.pattern_moduleManager, this.onModuleManagerMessageAsync);
        }

        this.container.set("module-manager", diExt.singleton(this));
    }

    public async newHostAsync(hostName: string): Promise<void> {
        if (String.isEmptyOrWhitespace(hostName)) {
            throw new Error("hostName cannot be null/undefined/empty.");
        }

        if (0 <= this.children.findIndex((child) => child.proxy.id === hostName)) {
            throw new Error(`hostName, "${hostName}", already exists.`);
        }

        const constructorOptions = mmutils.generateModuleManagerConstructorOptions(this);
        const childProcess: child_process.ChildProcess =
            child_process.fork("./bootstrap.js", [JSON.stringify(constructorOptions)]);

        const childCommunicator = new NodeCommunicator(childProcess, hostName);
        const proxy = await ObjectRemotingProxy.create(this.pattern_proxy, childCommunicator, true);

        if (!this.children) {
            this.children = [];
        }

        proxy.setResolver(this.onProxyResolvingAsync);

        this.children.push({
            process: childProcess,
            proxy: proxy,
            communicator: childCommunicator
        });
    }

    public async destroyHostAsync(hostName: string): Promise<void> {
        if (String.isEmptyOrWhitespace(hostName)) {
            throw new Error("hostName cannot be null/undefined/empty.");
        }

        if (!this.children) {
            return;
        }

        const childIndex = this.children.findIndex((child) => child.proxy.id === hostName);

        if (childIndex < 0) {
            return;
        }

        const child = this.children[childIndex];

        await child.proxy.dispose();
        child.process.kill();

        this.children.splice(childIndex, 1);

        child.communicator = undefined;
        child.process = undefined;
        child.proxy = undefined;
    }

    public async loadModuleDirAsync(dirName: string, hostName?: string, respectLoadingMode?: boolean): Promise<void> {
        if (!fs.existsSync(dirName)) {
            throw new Error(`Directory "${dirName}" doesn't exist.`);
        }

        const dirStat = fs.statSync(dirName);

        if (!dirStat.isDirectory()) {
            throw new Error(`Path "${dirName}" is not a directory.`);
        }

        if (!utils.isNullOrUndefined(hostName) && !String.isEmptyOrWhitespace(hostName)) {
            let childIndex = this.children.findIndex((child) => child.proxy.id === hostName);

            if (childIndex < 0) {
                await this.newHostAsync(hostName);
                childIndex = this.children.findIndex((child) => child.proxy.id === hostName);
            }

            const child = this.children[childIndex];

            await child.communicator.sendAsync<ILoadModuleDirAsyncMessage, void>(
                this.pattern_moduleManager.getRaw(),
                {
                    action: ModuleManagerAction.loadModuleDirAsync,
                    content: dirName
                });
        } else {
            const loadingTasks: Array<Promise<void>> = [];

            for (const subName of fs.readdirSync(dirName)) {
                const modulePath = path.join(dirName, subName);
                const moduleStat = fs.statSync(modulePath);

                if (moduleStat.isFile() && path.extname(modulePath) !== ".js") {
                    continue;
                }

                loadingTasks.push(this.loadModuleAsync(modulePath, hostName, respectLoadingMode));
            }

            await Promise.all(loadingTasks);
        }
    }

    public async loadModuleAsync(path: string, hostName?: string, respectLoadingMode?: boolean): Promise<void> {
        if (!fs.existsSync(path)) {
            throw new Error(`path "${path}" doesn't exist.`);
        }

        if (!utils.isNullOrUndefined(hostName) && !String.isEmptyOrWhitespace(hostName)) {
            let childIndex = this.children.findIndex((child) => child.proxy.id === hostName);

            if (childIndex < 0) {
                await this.newHostAsync(hostName);
                childIndex = this.children.findIndex((child) => child.proxy.id === hostName);
            }

            const child = this.children[childIndex];

            await child.communicator.sendAsync<ILoadModuleAsyncMessage, void>(
                this.pattern_moduleManager.getRaw(),
                {
                    action: ModuleManagerAction.loadModuleAsync,
                    content: path
                });
        } else {
            this.loadModule(path, respectLoadingMode);
        }
    }

    public registerComponents(componentInfos: Array<IComponentInfo>): void {
        if (!Array.isArray(componentInfos)) {
            throw new Error("componentInfos must be an array of IComponentInfo.");
        }

        for (const componentInfo of componentInfos) {
            if (componentInfo.singleton === true) {
                this.container.set(componentInfo.name, diExt.lazySingleton(componentInfo.descriptor, componentInfo.deps));
            } else {
                this.container.set(componentInfo.name, diExt.dedication(componentInfo.descriptor, componentInfo.deps));
            }
        }
    }

    public async getComponentAsync<T extends IDisposable>(componentIdentity: string, ...extraArgs: Array<any>): Promise<T> {
        if (String.isEmptyOrWhitespace(componentIdentity)) {
            throw new Error("componentIdentity cannot be null/undefined/empty.");
        }

        const component = this.container.getDep<T>(componentIdentity, ...extraArgs);

        if (component !== undefined) {
            return component;
        }

        return this.getComponentFromProxiesAsync<T>(null, componentIdentity, ...extraArgs);
    }

    public onHostVersionMismatch(callback?: HostVersionMismatchEventHandler): void | HostVersionMismatchEventHandler {
        if (callback === undefined) {
            return this.hostVersionMismatchHandler;
        } else if (callback === null) {
            this.hostVersionMismatchHandler = null;
        } else if (Function.isFunction(callback)) {
            this.hostVersionMismatchHandler = callback;
        } else {
            throw new Error("Provided callback must be a function.");
        }
    }

    private loadModule(path: string, respectLoadingMode?: boolean): void {
        const module: IModule = require(path);

        if (!Function.isFunction(module.getModuleMetadata)) {
            throw new Error(`Invalid module "${path}": missing getModuleMetadata().`);
        }

        this.modulePaths.push(path);

        const moduleInfo = module.getModuleMetadata();

        if (respectLoadingMode === true && moduleInfo.loadingMode !== "Always") {
            return;
        }

        if (!utils.isNullOrUndefined(moduleInfo.hostVersion)
            && !String.isEmptyOrWhitespace(moduleInfo.hostVersion)
            && !semver.gte(this.hostVersion, moduleInfo.hostVersion)) {
            if (!Function.isFunction(this.hostVersionMismatchHandler)
                || !this.hostVersionMismatchHandler(moduleInfo, this.hostVersion, moduleInfo.hostVersion)) {
                throw new Error(
                    `Invalid module "${path}": Expected host version: ${moduleInfo.hostVersion}. Current host version: ${this.hostVersion}`);
            }
        }

        if (moduleInfo.components) {
            if (!Array.isArray(moduleInfo.components)) {
                throw new Error(
                    `Invalid module "${path}": ModuleMetadata.components must be an array of IComponentInfo.`);
            }

            this.registerComponents(moduleInfo.components);
        }

        if (Function.isFunction(module.initialize)) {
            module.initialize(this);
        }
    }

    private async getComponentFromProxiesAsync<T extends IDisposable>(
        fromProxy: IObjectRemotingProxy,
        componentIdentity: string,
        ...extraArgs: Array<any>)
        : Promise<T> {
        const fromProxyId = fromProxy ? fromProxy.id : null;

        if (this.children) {
            for (const child of this.children) {
                if (fromProxyId === child.proxy.id) {
                    continue;
                }

                const component = await child.proxy.requestAsync<T>(componentIdentity, ...extraArgs);

                if (component) {
                    return component;
                }
            }
        }

        if (this.parentProxy && this.parentProxy.id !== fromProxyId) {
            return await this.parentProxy.requestAsync<T>(componentIdentity, ...extraArgs);
        }

        return undefined;
    }

    private onProxyResolvingAsync: Resolver =
        async (proxy: IObjectRemotingProxy, name: string, ...extraArgs: Array<any>): Promise<IDisposable> => {
            const dep = this.container.getDep<IDisposable>(name, ...extraArgs);

            if (dep) {
                return dep;
            }

            return await this.getComponentFromProxiesAsync(proxy, name, ...extraArgs);
        }

    private onModuleManagerMessageAsync: RequestHandler =
        async (communicator: ICommunicator, path: string, content: IModuleManagerMessage): Promise<any> => {
            switch (content.action) {
                case ModuleManagerAction.loadModuleDirAsync:
                    const loadDirMsg = <ILoadModuleDirAsyncMessage>content;
                    await this.loadModuleDirAsync(loadDirMsg.content);
                    break;

                case ModuleManagerAction.loadModuleAsync:
                    const loadModuleMsg = <ILoadModuleAsyncMessage>content;
                    await this.loadModuleAsync(loadModuleMsg.content);
                    break;

                default:
                    throw new Error(`Unknown ModuleManagerAction: ${content.action}`);
            }
        }
}
