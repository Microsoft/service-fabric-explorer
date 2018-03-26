//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as utils from "../../utilities/utils";
import error from "../../utilities/errorUtil";

export class ObjectSchema {
    public static generateSchema(obj: any): ObjectSchema {

    }
}

export function isCommunicator(communicator: any): communicator is ICommunicator {
    return !utils.isNullOrUndefined(communicator)
        && String.isString(communicator.id)
        && Function.isFunction(communicator.getRequestHandler)
        && Function.isFunction(communicator.setRequestHandler)
        && Function.isFunction(communicator.sendAsync);
}
