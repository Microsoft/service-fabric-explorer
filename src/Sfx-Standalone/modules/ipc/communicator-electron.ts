//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { webContents } from "electron";
import * as uuidv4 from "uuid/v4";
import * as uuidv5 from "uuid/v5";

import { ILog } from "../../@types/log";
import { ISender } from "../../@types/ipc";
import * as utils from "../../utilities/utils";
import error from "../../utilities/errorUtil";
import { Communicator } from "./common";
import { isRemote, electron, remote } from "../../utilities/electron-adapter";
import { appCodeName } from "../../utilities/appUtils";

interface IEventEmmiter {
    send(channel: string, ...args: any[]): void;
    sendSync?(channel: string, ...args: any[]): any;
}

interface IEventListener {
    on(channel: string, listener: (event: Electron.Event, ...args: Array<any>) => any): this;
    removeListener(channel: string, listener: (event: Electron.Event, ...args: Array<any>) => any): this;
}

class ElectronResponser implements ISender {
    public readonly id;

    private readonly channelName: string;

    private readonly eventEmmiter: IEventEmmiter;

    constructor(channelName: string, webContents: webContents) {
        this.eventEmmiter = webContents;
        this.channelName = channelName;
        this.id = uuidv5(webContents.id.toString(), idNamespace);

        if (utils.isNullOrUndefined(this.eventEmmiter.sendSync)) {
            this.sendSync = undefined;
        }
    }

    public send<TResult>(eventName: string, ...args: Array<any>): void {
        if (String.isNullUndefinedOrWhitespace(eventName)) {
            throw error("eventName must be supplied.");
        }

        this.eventEmmiter.send(this.channelName, eventName, ...args);
    }

    public sendSync<TData, TResult>(eventName: string, ...args: Array<any>): TResult {
        if (String.isNullUndefinedOrWhitespace(eventName)) {
            throw error("eventName must be supplied.");
        }

        return this.eventEmmiter.sendSync(this.channelName, eventName, ...args);
    }
}

const idNamespace = "4133573E-F47F-487B-A1C5-5A6AECA17FF2";

export default class ElectronCommunicator extends Communicator {
    public readonly isHost: boolean;

    public readonly id: string;

    private readonly log: ILog;

    private readonly channelName: string;

    private eventEmmiter: IEventEmmiter;

    private eventListener: IEventListener;

    private responsers: IDictionary<ISender>;

    constructor(log: ILog, webContentId?: number, channelName?: string) {
        super();

        if (!Object.isObject(log)) {
            throw error("log must be supplied.");
        }

        this.log = log;

        let webContents: Electron.WebContents;

        if (isRemote) {
            this.eventListener = electron.ipcRenderer;
            this.eventEmmiter = electron.ipcRenderer;

            webContents = remote.getCurrentWebContents();
        } else {
            if (utils.isNullOrUndefined(webContents)) {
                webContents = undefined;
            } else if (!Number.isNumber(webContentId)) {
                throw error("In main process, webContentId argument must be supplied with a valid id of the webContents.");
            } else {
                webContents = electron.webContents.fromId(webContentId);
            }

            this.eventListener = electron.ipcMain;
            this.eventEmmiter = webContents;
        }

        if (utils.isNullOrUndefined(channelName)) {
            if (webContents === undefined) {
                this.channelName = uuidv4();
            } else {
                this.channelName = String.format("{}-electron-ipc/{}", appCodeName, webContents.id.toString());
            }
        } else if (String.isString(channelName)) {
            if (channelName.trim() === "") {
                throw error("channelName can be null or undefined but not empty.");
            }

            this.channelName = channelName;
        } else {
            throw error("channelName must be a string.");
        }

        this.isHost = this.eventEmmiter === undefined;
        this.responsers = this.isHost ? {} : undefined;
        this.id = this.isHost ? uuidv4() : uuidv5(webContents.id.toString(), idNamespace);
        this.eventListener.on(this.channelName, this.onData);

        if (this.isHost) {
            this.log.writeInfo("[ipc:{}, cid:{}] Host is created.", this.channelName, this.id);
        } else {
            this.log.writeInfo("[ipc:{}, cid:{}] client is created.", this.channelName, this.id);
        }

        if (this.isHost || utils.isNullOrUndefined(this.eventEmmiter.sendSync)) {
            this.sendSync = undefined;
        }
    }

    public send<TResult>(eventName: string, ...args: Array<any>): void {
        this.validateDisposal();

        if (this.eventEmmiter === undefined) {
            throw error("The communicator cannot active send but passive receive.");
        }

        if (String.isNullUndefinedOrWhitespace(eventName)) {
            throw error("eventName must be supplied.");
        }

        this.eventEmmiter.send(this.channelName, eventName, ...args);
    }

    public sendSync<TData, TResult>(eventName: string, ...args: Array<any>): TResult {
        this.validateDisposal();

        if (this.eventEmmiter === undefined) {
            throw error("The communicator cannot active send but passive receive.");
        }

        if (this.eventEmmiter.sendSync === undefined) {
            throw error("sendSync is not supported.");
        }

        if (String.isNullUndefinedOrWhitespace(eventName)) {
            throw error("eventName must be supplied.");
        }

        return this.eventEmmiter.sendSync(this.channelName, eventName, ...args);
    }

    protected disposing(): void {
        this.eventListener.removeListener(this.channelName, this.onData);
        this.log.writeInfo("[ipc:{}, cid:{}] Host is disposed.", this.channelName, this.id);
        this.eventEmmiter = undefined;
        this.eventListener = undefined;
        this.responsers = undefined;

        super.disposing();
    }

    protected readonly onData = (event: Electron.Event, eventName: string, ...args: Array<any>): void => {
        if (String.isNullUndefinedOrWhitespace(eventName)) {
            return;
        }

        let responser: ISender = this;

        if (this.isHost) {
            const responserId: string = event.sender.id.toString();

            if (this.responsers[responserId] === undefined) {
                this.responsers[responserId] = new ElectronResponser(this.channelName, event.sender);
            }

            responser = this.responsers[responserId];
        }

        this.log.writeVerbose("[ipc:{}, cid:{}] Event, {}, recevied from cid:{}.", this.channelName, this.id, eventName, responser.id);
        const result = this.triggerEvent(eventName, responser, ...args);

        if (result !== undefined) {
            event.returnValue = result;
        }
    }
}
