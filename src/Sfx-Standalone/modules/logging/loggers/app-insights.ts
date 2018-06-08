//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IDictionary } from "sfx";
import { Severity, ILogger, ILoggerSettings } from "sfx.logging";

import { TelemetryClient, Contracts } from "applicationinsights";
import { Telemetry, TraceTelemetry, ExceptionTelemetry, MetricTelemetry } from "applicationinsights/out/Declarations/Contracts";

import * as utils from "../../../utilities/utils";
import error from "../../../utilities/errorUtil";
import { Severities } from "../log";

function toAppInsightsSeverity(severity: Severity): Contracts.SeverityLevel {
    switch (severity) {
        case Severities.Critical:
            return Contracts.SeverityLevel.Critical;

        case Severities.Information:
            return Contracts.SeverityLevel.Information;

        case Severities.Warning:
            return Contracts.SeverityLevel.Warning;

        case Severities.Error:
            return Contracts.SeverityLevel.Error;

        case Severities.Verbose:
        default:
            return Contracts.SeverityLevel.Verbose;
    }
}

export default class AppInsightsLogger implements ILogger {
    private client: TelemetryClient;

    public readonly name: string;

    public get disposed(): boolean {
        return this.client === undefined;
    }

    constructor(settings: ILoggerSettings) {
        if (!Object.isObject(settings)) {
            throw error("settings must be supplied.");
        }

        this.name = settings.name;
        this.client = new TelemetryClient(settings["instrumentationKey"]);
    }

    public write(properties: IDictionary<string>, severity: Severity, message: string): void {
        this.validateDisposal();

        let telemetry: TraceTelemetry = {
            severity: toAppInsightsSeverity(severity),
            message: message
        };

        if (!utils.isNullOrUndefined(properties)) {
            telemetry.properties = properties;
        }

        this.client.trackTrace(telemetry);
    }

    public writeException(properties: IDictionary<string>, error: Error): void {
        this.validateDisposal();

        let telemetry: ExceptionTelemetry = {
            exception: error
        };

        if (!utils.isNullOrUndefined(properties)) {
            telemetry.properties = properties;
        }

        this.client.trackException(telemetry);
    }

    public writeMetric(properties: IDictionary<string>, name: string, value: number): void {
        this.validateDisposal();
        
        let telemetry: MetricTelemetry = {
            name: name,
            value: value
        };

        if (!utils.isNullOrUndefined(properties)) {
            telemetry.properties = properties;
        }

        this.client.trackMetric(telemetry);
    }

    public dispose(): void {
        this.client = undefined;
    }

    private validateDisposal(): void {
        if (this.disposed) {
            throw error("Logger, \"{}\", already disposed.", this.name);
        }
    }
}
