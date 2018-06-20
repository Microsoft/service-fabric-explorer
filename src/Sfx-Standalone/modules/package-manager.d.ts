//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "sfx.package-manager" {
    import { IDictionary } from "sfx.common";
    import { IModuleLoadingPolicy } from "sfx.module-manager";

    export interface IPackageRepositoryConfig {
        readonly name: string;
        readonly url: string;
    }

    export interface IPackageRepository {
        installPackage(packageName: string): void;
    }

    export interface IPackageManager extends IModuleLoadingPolicy {
        addRepo(repoConfig: IPackageRepositoryConfig): void;
        removeRepo(repoName: string): void;

        getRepos(): Array<IPackageRepository>;
        getRepoConfigs(): Array<IPackageRepositoryConfig>;

        installPackage(repoName: string, packageName: string): void;
        uninstallPackage(packageName: string): void;
    }
}

declare module "sfx.module-manager" {
    import { IPackageManager } from "sfx.package-manager";

    export interface IModuleManager {
        getComponentAsync(componentIdentity: "package-manager"): Promise<IPackageManager>;
    }
}
