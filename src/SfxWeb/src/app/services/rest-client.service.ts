import { Injectable } from '@angular/core';
import { MessageService, MessageSeverity } from './message.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HealthStateFilterFlags, IClusterHealthChunkQueryDescription } from '../Models/HealthChunkRawDataTypes';
import { IResponseMessageHandler, ResponseMessageHandlers } from '../Common/ResponseMessageHandlers';
import { Observable, of, throwError } from 'rxjs';
import { IRawCollection, IRawClusterManifest, IRawClusterHealth, IRawClusterUpgradeProgress, IRawClusterLoadInformation,
        IRawDeployedContainerOnNetwork, IRawNode, IRawBackupPolicy, IRawApplicationBackupConfigurationInfo,
         IRawServiceBackupConfigurationInfo, IRawBackupProgressInfo, IRawRestoreProgressInfo, IRawPartitionBackupConfigurationInfo, IRawPartitionBackup, IRawNodeHealth,
         IRawNodeLoadInformation, IRawDeployedApplication, IRawApplicationHealth, IRawDeployedServicePackage, IRawDeployedServicePackageHealth, IRawServiceManifest,
         IRawDeployedReplica, IRawServiceType, IRawDeployedCodePackage, IRawContainerLogs, IRawDeployedReplicaDetail, IRawApplicationType, IRawApplicationManifest,
         IRawApplication, IRawService, IRawCreateServiceDescription, IRawCreateServiceFromTemplateDescription, IRawUpdateServiceDescription, IRawServiceDescription,
         IRawServiceHealth, IRawApplicationUpgradeProgress, IRawCreateComposeDeploymentDescription, IRawPartition, IRawPartitionHealth, IRawPartitionLoadInformation,
         IRawReplicaOnPartition, IRawReplicaHealth, IRawImageStoreContent, IRawStoreFolderSize, IRawClusterVersion, IRawList, IRawAadMetadata, IRawStorage, IRawRepairTask,
         IRawServiceNameInfo, IRawApplicationNameInfo, IRawBackupEntity } from '../Models/RawDataTypes';
import { mergeMap, map, catchError, finalize, skip } from 'rxjs/operators';
import { Application } from '../Models/DataModels/Application';
import { Service } from '../Models/DataModels/Service';
import { Partition } from '../Models/DataModels/Partition';
import { ClusterEvent, NodeEvent, ApplicationEvent, ServiceEvent, PartitionEvent, ReplicaEvent,
         FabricEvent, EventsResponseAdapter, FabricEventBase } from '../Models/eventstore/Events';
import { StandaloneIntegration } from '../Common/StandaloneIntegration';
import { AadMetadata } from '../Models/DataModels/Aad';
import { environment } from 'src/environments/environment';
import { IRequest, NetworkDebugger } from '../Models/DataModels/networkDebugger';
import { uuid4 } from 'vis-uuid';
import { Constants } from '../Common/Constants';
@Injectable({
  providedIn: 'root'
})
export class RestClientService {

  constructor(private httpClient: HttpClient, private message: MessageService) {

  }

  private static defaultApiVersion = '3.0';
  private static apiVersion40 = '4.0';
  private static apiVersion60 = '6.0';
  private static apiVersion64 = '6.4';
  private static apiVersion65 = '6.5';
  private static apiVersion72 = '7.2';
  private static apiVersion80 = '8.0';

  private cacheAllowanceToken: number = Date.now().valueOf();

  public networkDebugger: NetworkDebugger = new NetworkDebugger();

  public invalidateBrowserRestResponseCache(): void {
      this.cacheAllowanceToken = Date.now().valueOf();
  }


  public getClusterHealth(
      eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
      nodesHealthStateFilter: number = HealthStateFilterFlags.Default,
      applicationsHealthStateFilter: number = HealthStateFilterFlags.Default,
      messageHandler?: IResponseMessageHandler): Observable<IRawClusterHealth> {

      const url = `$/GetClusterHealth?NodesHealthStateFilter=${nodesHealthStateFilter}`
          + `&ApplicationsHealthStateFilter=${applicationsHealthStateFilter}&EventsHealthStateFilter=${eventsHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get cluster health', messageHandler);
  }

  public getClusterManifest(messageHandler?: IResponseMessageHandler): Observable<IRawClusterManifest> {
      return this.get(this.getApiUrl('$/GetClusterManifest'), 'Get cluster manifest', messageHandler);
  }

  public getClusterUpgradeProgress(messageHandler?: IResponseMessageHandler): Observable<IRawClusterUpgradeProgress> {
      return this.get(this.getApiUrl('$/GetUpgradeProgress'), 'Get cluster upgrade progress', messageHandler);
  }

  public getClusterLoadInformation(messageHandler?: IResponseMessageHandler): Observable<IRawClusterLoadInformation> {
      return this.get(this.getApiUrl('$/GetLoadInformation'), 'Get cluster load information', messageHandler);
  }

  public getClusterHealthChunk(healthDescriptor: IClusterHealthChunkQueryDescription, messageHandler?: IResponseMessageHandler): Observable<{}> {
      return this.post(this.getApiUrl('$/GetClusterHealthChunk'), 'Get cluster health chunk', healthDescriptor, messageHandler);
  }

  public getDeployedContainersOnNetwork(networkName: string, nodeName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedContainerOnNetwork[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/GetNetworks/' + encodeURIComponent(networkName) + '/$/GetCodePackages';
      return this.getFullCollection<IRawDeployedContainerOnNetwork>(url, 'Get containers on network', RestClientService.apiVersion60);
  }

  public getNodes(messageHandler?: IResponseMessageHandler): Observable<IRawNode[]> {
      return this.getFullCollection<IRawNode>('Nodes/', 'Get nodes');
  }

  public getNode(nodeName: string, messageHandler?: IResponseMessageHandler): Observable<IRawNode> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/';
      return this.get(this.getApiUrl(url), 'Get node', messageHandler);
  }

  /// $/GetAadMetadata?api-version=6.0

  public getAADmetadata(messageHandler?: IResponseMessageHandler): Observable<AadMetadata> {
    const url = '$/GetAadMetadata/';
    return this.get<IRawAadMetadata>(this.getApiUrl(url, RestClientService.apiVersion60), 'Get aadmetadata', messageHandler).pipe(map(data => new AadMetadata(data)));
}


  public getBackupPolicies(messageHandler?: IResponseMessageHandler): Observable<IRawBackupPolicy[]> {
      return this.getFullCollection<IRawBackupPolicy>('BackupRestore/BackupPolicies/', 'Get backup Policies', RestClientService.apiVersion64);
  }

  public getApplicationBackupConfigurationInfoCollection(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplicationBackupConfigurationInfo[]> {
      return this.getFullCollection<IRawApplicationBackupConfigurationInfo>('Applications/' + encodeURIComponent(applicationId) + '/$/GetBackupConfigurationInfo', 'Gets the application backup configuration information', RestClientService.apiVersion64, messageHandler);
  }

  public getServiceBackupConfigurationInfoCollection(serviceId: string, messageHandler?: IResponseMessageHandler): Observable<IRawServiceBackupConfigurationInfo[]> {
      return this.getFullCollection<IRawServiceBackupConfigurationInfo>('Services/' + encodeURIComponent(serviceId) + '/$/GetBackupConfigurationInfo', 'Gets the application backup configuration information', RestClientService.apiVersion64, messageHandler);
  }

  public getPartitionBackupProgress(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawBackupProgressInfo> {
      return this.get(this.getApiUrl('Partitions/' + encodeURIComponent(partitionId) + '/$/GetBackupProgress', RestClientService.apiVersion64), 'Gets the partition backup progress', messageHandler);
  }

  public getPartitionRestoreProgress(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawRestoreProgressInfo> {
      return this.get(this.getApiUrl('Partitions/' + encodeURIComponent(partitionId) + '/$/GetRestoreProgress', RestClientService.apiVersion64), 'Gets the partition restore progress', messageHandler);
  }

  public getPartitionBackupConfigurationInfo(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartitionBackupConfigurationInfo> {
      return this.get(this.getApiUrl('Partitions/' + encodeURIComponent(partitionId) + '/$/GetBackupConfigurationInfo', RestClientService.apiVersion64), 'Gets the partition backup configuration information', messageHandler);
  }

  public getLatestPartitionBackup(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartitionBackup[]> {
      return this.getFullCollection2<IRawPartitionBackup>('Partitions/' + encodeURIComponent(partitionId) + '/$/GetBackups', 'Gets the latest partition backup',
                                                          RestClientService.apiVersion64, messageHandler, undefined, undefined, undefined, undefined, true);
  }

  public getPartitionBackupList(partitionId: string, messageHandler?: IResponseMessageHandler, startDate?: Date, endDate?: Date, maxResults?: number): Observable<IRawPartitionBackup[]> {
      return this.getFullCollection2<IRawPartitionBackup>('Partitions/' + encodeURIComponent(partitionId) + '/$/GetBackups', 'Gets the partition backup list', RestClientService.apiVersion64,
                                                          messageHandler, undefined, startDate, endDate, maxResults);
  }

  public getBackupPolicy(backupName: string, messageHandler?: IResponseMessageHandler): Observable<IRawBackupPolicy> {
      const url = 'BackupRestore/BackupPolicies/' + encodeURIComponent(backupName) + '/';
      return this.get(this.getApiUrl(url, RestClientService.apiVersion64), 'Get backup policy', messageHandler);
  }

  public getNodeHealth(nodeName: string,
                       eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                       messageHandler?: IResponseMessageHandler): Observable<IRawNodeHealth> {

      const url = `Nodes/${encodeURIComponent(nodeName)}/$/GetHealth?EventsHealthStateFilter=${eventsHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get node health', messageHandler);
  }

  public getNodeLoadInformation(nodeName: string, messageHandler?: IResponseMessageHandler): Observable<IRawNodeLoadInformation> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/GetLoadInformation';
      return this.get(this.getApiUrl(url), 'Get node load information', messageHandler);
  }

  public restartNode(nodeName: string, nodeInstanceId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/Restart';

      const body = {
          NodeInstanceId: nodeInstanceId
      };

      return this.post(this.getApiUrl(url), 'Node restart', body, messageHandler);
  }

  public getDeployedApplications(nodeName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedApplication[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/GetApplications';
      return this.get(this.getApiUrl(url), 'Get applications', messageHandler);
  }

  public getDeployedApplication(nodeName: string, applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedApplication> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId);

      return this.get(this.getApiUrl(url), 'Get deployed applications', messageHandler);
  }

  public getDeployedApplicationHealth(
      nodeName: string, applicationId: string,
      eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
      deployedServicePackagesHealthStateFilter: number = HealthStateFilterFlags.Default,
      messageHandler?: IResponseMessageHandler
  ): Observable<IRawApplicationHealth> {

      const url = `Nodes/${encodeURIComponent(nodeName)}/$/GetApplications/${encodeURIComponent(applicationId)}/$/GetHealth`
          + `?EventsHealthStateFilter=${eventsHealthStateFilter}&DeployedServicePackagesHealthStateFilter=${deployedServicePackagesHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get application health', messageHandler);
  }

  public getDeployedServicePackages(nodeName: string, applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedServicePackage[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetServicePackages';

      return this.get(this.getApiUrl(url), 'Get deployed service packages', messageHandler);
  }

  public getDeployedServicePackage(nodeName: string, applicationId: string, servicePackageName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedServicePackage[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetServicePackages/' + encodeURIComponent(servicePackageName);

      return this.get(this.getApiUrl(url), 'Get deployed service package on application', messageHandler);
  }

  public getDeployedServicePackageHealth(nodeName: string, applicationId: string, servicePackageName: string,
                                         servicePackageActivationId: string,
                                         eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                                         messageHandler?: IResponseMessageHandler): Observable<IRawDeployedServicePackageHealth> {

      const url = `Nodes/${encodeURIComponent(nodeName)}/$/GetApplications/${encodeURIComponent(applicationId)}`
          + `/$/GetServicePackages/${encodeURI(servicePackageName)}`
          + `/$/GetHealth?EventsHealthStateFilter=${eventsHealthStateFilter}`
          + (servicePackageActivationId ? `&ServicePackageActivationId=${servicePackageActivationId}` : '');

      return this.get(this.getApiUrl(url), 'Get deployed service package health', messageHandler);
  }

  public getServiceManifest(appTypeName: string, appTypeVersion: string, serviceManifestName: string, messageHandler?: IResponseMessageHandler): Observable<IRawServiceManifest> {
      const url = 'ApplicationTypes/' + encodeURIComponent(appTypeName)
          + '/$/GetServiceManifest';

      const formedUrl = this.getApiUrl(url) + '&ApplicationTypeVersion=' + encodeURIComponent(appTypeVersion)
          + '&ServiceManifestName=' + encodeURIComponent(serviceManifestName);

      return this.get(formedUrl, 'Get service manifest for application type', messageHandler);
  }

  public getServiceTypes(appTypeName: string, appTypeVersion: string, messageHandler?: IResponseMessageHandler): Observable<IRawServiceType[]> {
      const url = 'ApplicationTypes/' + encodeURIComponent(appTypeName)
          + '/$/GetServiceTypes?ApplicationTypeVersion=' + encodeURIComponent(appTypeVersion);

      const formedUrl = this.getApiUrl(url); // + '&ApplicationTypeVersion=' + encodeURIComponent(appTypeVersion);

      return this.get(formedUrl, 'Get service types for application type', messageHandler);
  }

  public getDeployedReplicas(nodeName: string, applicationId: string, servicePackageName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedReplica[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetReplicas';

      const formedUrl = this.getApiUrl(url)
          + '&ServiceManifestName=' + encodeURIComponent(servicePackageName);

      return this.get(formedUrl, 'Get replicas on service', messageHandler);
  }

  public getDeployedCodePackages(nodeName: string, applicationId: string, servicePackageName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedCodePackage[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetCodePackages';

      const formedUrl = this.getApiUrl(url)
          + '&ServiceManifestName=' + encodeURIComponent(servicePackageName);

      return this.get(formedUrl, 'Get deployed code packages', messageHandler);
  }


// tslint:disable-next-line:max-line-length
  public getDeployedCodePackage(nodeName: string, applicationId: string, servicePackageName: string, codePackageName: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedCodePackage[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetCodePackages';

      const formedUrl = this.getApiUrl(url)
          + '&ServiceManifestName=' + encodeURIComponent(servicePackageName)
          + '&CodePackageName=' + encodeURIComponent(codePackageName);

      return this.get(formedUrl, 'Get deployed code package', messageHandler);
  }

// tslint:disable-next-line:max-line-length
  public getDeployedContainerLogs(nodeName: string, applicationId: string, servicePackageName: string, codePackageName: string, servicePackageActivationId: string, tail: string, messageHandler?: IResponseMessageHandler): Observable<IRawContainerLogs> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetCodePackages'
          + '/$/ContainerLogs';

      const formedUrl = this.getApiUrl(url)
          + '&ServiceManifestName=' + encodeURIComponent(servicePackageName)
          + '&CodePackageName=' + encodeURIComponent(codePackageName)
          + '&ServicePackageActivationId=' + encodeURIComponent(servicePackageActivationId)
          + '&Tail=' + encodeURIComponent(tail);

      return this.get(formedUrl, 'Get deployed container logs', messageHandler);
  }

    // tslint:disable-next-line:max-line-length
  public restartCodePackage(nodeName: string, applicationId: string, serviceManifestName: string, codePackageName: string, codePackageInstanceId: string, servicePackageActivationId?: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetCodePackages/$/Restart';

      const body: any = {
          ServiceManifestName: serviceManifestName,
          CodePackageName: codePackageName,
          CodePackageInstanceId: codePackageInstanceId
      };

      if (servicePackageActivationId) {
          body.ServicePackageActivationId = servicePackageActivationId;
      }

      return this.post(this.getApiUrl(url), 'Code package restart', body, messageHandler);
  }

  // PartitionID along with the other params us enough to identify the Replica. Replica/InstanceId is Not unique nor an identifier.
  // TODO: Potential refactor: have this return the singular [by transforming the data we get back] as we expact only a single item in the returned array.
  public getDeployedReplica(nodeName: string, applicationId: string, servicePackageName: string, partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedReplica[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetReplicas';

      const formedUrl = this.getApiUrl(url)
          + '&PartitionId=' + encodeURIComponent(partitionId)
          + '&ServiceManifestName=' + encodeURIComponent(servicePackageName);

      return this.get(formedUrl, 'Get deployed replica', messageHandler);
  }

  public getDeployedReplicaDetail(nodeName: string, partitionId: string, replicaId: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedReplicaDetail> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId)
          + '/$/GetReplicas/' + encodeURIComponent(replicaId)
          + '/$/GetDetail';

      return this.get(this.getApiUrl(url), 'Get deployed replica detail', messageHandler);
  }

  public getApplicationTypes(appTypeName?: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplicationType[]> {
      if (appTypeName) {
          return this.get(this.getApiUrl('ApplicationTypes/' + encodeURIComponent(appTypeName)), 'Get application type');
      }

      return this.get(this.getApiUrl('ApplicationTypes/'), 'Get application types', messageHandler);
  }

  public getApplicationManifestForApplicationType(appTypeName: string, appTypeVersion: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplicationManifest> {
      const url = 'ApplicationTypes/' + encodeURIComponent(appTypeName)
          + '/$/GetApplicationManifest?ApplicationTypeVersion=' + encodeURIComponent(appTypeVersion);
      return this.get(this.getApiUrl(url), 'Get application manifest for application type');
  }

  public provisionApplication(name: string, appTypeName: string, appTypeVersion, messageHandler?: IResponseMessageHandler): Observable<any> {
      const url = 'Applications/$/Create';

      const body: any = {
          Name: name,
          TypeName: appTypeName,
          TypeVersion: appTypeVersion
      };

      return this.post(this.getApiUrl(url), 'Application instance creation', body, messageHandler);
  }

  public activateNode(nodeName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/Activate';
      return this.post(this.getApiUrl(url), 'Node Activation', null, messageHandler);
  }

  public deactivateNode(nodeName: string, intent: number, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/Deactivate';
      return this.post(this.getApiUrl(url), 'Node deactivation', { DeactivationIntent: intent }, messageHandler);
  }

  public removeNodeState(nodeName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Nodes/' + encodeURIComponent(nodeName) + '/$/RemoveNodeState';
      return this.post(this.getApiUrl(url), 'Node state removal', null, messageHandler);
  }

  public getApplications(messageHandler?: IResponseMessageHandler): Observable<IRawApplication[]> {
      return this.getFullCollection<IRawApplication>('Applications/', 'Get applications', null, messageHandler);
  }

  public getServices(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawService[]> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/$/GetServices';
      return this.getFullCollection<IRawService>(url, 'Get services', null, messageHandler);
  }

  public getService(applicationId: string, serviceId: string, messageHandler?: IResponseMessageHandler): Observable<IRawService> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId);

      return this.get(this.getApiUrl(url), 'Get service', messageHandler);
  }

  public createService(applicationId: string, serviceDescription: IRawCreateServiceDescription, messageHandler?: IResponseMessageHandler): Observable<IRawService> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/$/Create';

      return this.post(this.getApiUrl(url), 'Service creation', serviceDescription, messageHandler);
  }

  public createServiceFromTemplate(applicationId: string, serviceDescription: IRawCreateServiceFromTemplateDescription, messageHandler?: IResponseMessageHandler): Observable<IRawService> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/$/CreateFromTemplate';

      return this.post(this.getApiUrl(url), 'Service creation', serviceDescription, messageHandler);
  }

  public updateService(applicationId: string, serviceId: string, updateServiceDescription: IRawUpdateServiceDescription, messageHandler?: IResponseMessageHandler): Observable<IRawService> {
      const url = `Applications/${encodeURIComponent(applicationId)}/$/GetServices/${encodeURIComponent(serviceId)}/$/Update`;

      return this.post(this.getApiUrl(url), 'Service update', updateServiceDescription, messageHandler);
  }

  public enableApplicationBackup(application: Application, policyName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(application.id) + '/$/EnableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Enable Application Backup', { BackupPolicyName: policyName }, messageHandler);
  }

  public disableApplicationBackup(application: Application, cleanBackup: boolean, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(application.id) + '/$/DisableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Disable Application Backup', { CleanBackup: cleanBackup }, messageHandler);
  }

  public enableServiceBackup(service: Service, backupPolicyName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Services/' + encodeURIComponent(service.id) + '/$/EnableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Enable Service Backup', { BackupPolicyName: backupPolicyName }, messageHandler);
  }

  public disableServiceBackup(service: Service, cleanBackup: boolean, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Services/' + encodeURIComponent(service.id) + '/$/DisableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Disable Service Backup', { CleanBackup: cleanBackup }, messageHandler);
  }

  public enablePartitionBackup(partition: Partition, backupPolicyName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Partitions/' + encodeURIComponent(partition.id) + '/$/EnableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Enable Service Backup', { BackupPolicyName: backupPolicyName }, messageHandler);
  }

  public disablePartitionBackup(partition: Partition, cleanBackup: boolean, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Partitions/' + encodeURIComponent(partition.id) + '/$/DisableBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Disable Service Backup', { CleanBackup: cleanBackup }, messageHandler);
  }

  public suspendApplicationBackup(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/$/SuspendBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Suspend Application Backup', null, messageHandler);
  }

  public resumeApplicationBackup(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/$/ResumeBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Resume Application Backup', null, messageHandler);
  }

  public suspendServiceBackup(serviceId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Services/' + encodeURIComponent(serviceId) + '/$/SuspendBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Suspend Service Backup', null, messageHandler);
  }

  public resumeServiceBackup(serviceId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Services/' + encodeURIComponent(serviceId) + '/$/ResumeBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Resume Service Backup', null, messageHandler);
  }

  public suspendPartitionBackup(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Partitions/' + encodeURIComponent(partitionId) + '/$/SuspendBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Suspend Partition Backup', null, messageHandler);
  }

  public resumePartitionBackup(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Partitions/' + encodeURIComponent(partitionId) + '/$/ResumeBackup';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Resume Partition Backup', null, messageHandler);
  }


  public deleteBackupPolicy(backupPolicyName: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'BackupRestore/BackupPolicies/' + encodeURIComponent(backupPolicyName) + '/$/Delete';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Backup Policy deletion', null, messageHandler);
  }

  public updateBackupPolicy(backupPolicy: IRawBackupPolicy, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'BackupRestore/BackupPolicies/' + encodeURIComponent(backupPolicy.Name) + '/$/Update';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64) + '&validateConnection=true', 'Backup Policy updation', backupPolicy, messageHandler);
  }

  public createBackupPolicy(backupPolicy: IRawBackupPolicy, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'BackupRestore/BackupPolicies/$/Create';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64) + '&validateConnection=true', 'Backup Policy creation', backupPolicy, messageHandler);
  }

  public triggerPartitionBackup(partition: Partition, timeOut: number, storage: IRawStorage,  messageHandler?: IResponseMessageHandler): Observable<{}> {
      let url = 'Partitions/' + encodeURIComponent(partition.id) + '/$/Backup';
      if (timeOut) {
          url += '?BackupTimeout=' + timeOut.toString();
      }
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Partition Backup trigger', { BackupStorage: storage }, messageHandler);
  }

  public restorePartitionBackup(partitionId: string, storage: IRawStorage, timeOut: number, backupId: string, backupLocation: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      let url = 'Partitions/' + encodeURIComponent(partitionId) + '/$/Restore';
      if (timeOut) {
          url += '?RestoreTimeout=' + timeOut.toString();
      }
      return this.post(this.getApiUrl(url, RestClientService.apiVersion64), 'Partition Backup restore', { BackupId: backupId,
                                                                                                          BackupStorage: storage,
                                                                                                          BackupLocation: backupLocation }, messageHandler);
  }

  public getBackupEnabledEntities(backupPolicyName: string, messageHandler?: IResponseMessageHandler): Observable<IRawBackupEntity[]> {
      const url = 'BackupRestore/BackupPolicies/' + encodeURIComponent(backupPolicyName) + '/$/GetBackupEnabledEntities';
      return this.getFullCollection<IRawBackupEntity>(url, 'Get Backup Enabled Entities', RestClientService.apiVersion64, messageHandler);
  }
  public getServiceDescription(applicationId: string, serviceId: string, messageHandler?: IResponseMessageHandler): Observable<IRawServiceDescription> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetDescription';

      return this.get(this.getApiUrl(url), 'Get service description', messageHandler);
  }

  public getServiceHealth(applicationId: string, serviceId: string,
                          eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                          partitionsHealthStateFilter: number = HealthStateFilterFlags.Default,
                          messageHandler?: IResponseMessageHandler): Observable<IRawServiceHealth> {

      const url = `Applications/${encodeURIComponent(applicationId)}/$/GetServices/${encodeURIComponent(serviceId)}`
          + `/$/GetHealth?EventsHealthStateFilter=${eventsHealthStateFilter}&PartitionsHealthStateFilter=${partitionsHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get service health', messageHandler);
  }

  public deleteService(applicationId: string, serviceId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/Delete';
      return this.post(this.getApiUrl(url), 'Service deletion', null, messageHandler);
  }

  public unprovisionApplicationType(applicationTypeName: string, applicationTypeVersion: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'ApplicationTypes/' + encodeURIComponent(applicationTypeName)
          + '/$/Unprovision';

      return this.post(this.getApiUrl(url), 'Application type unprovision', { ApplicationTypeVersion: applicationTypeVersion }, messageHandler);
  }

  public getApplication(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplication> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/';
      return this.get(this.getApiUrl(url), 'Get application', messageHandler);
  }

  public getApplicationHealth(applicationId: string,
                              eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                              servicesHealthStateFilter: number = HealthStateFilterFlags.Default,
                              deployedApplicationsHealthStateFilter: number = HealthStateFilterFlags.Default,
                              messageHandler?: IResponseMessageHandler): Observable<IRawApplicationHealth> {

      const url = `Applications/${encodeURIComponent(applicationId)}/$/GetHealth`
          + `?EventsHealthStateFilter=${eventsHealthStateFilter}&DeployedApplicationsHealthStateFilter=${deployedApplicationsHealthStateFilter}`
          + `&ServicesHealthStateFilter=${servicesHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get application health', messageHandler);
  }

  public getApplicationUpgradeProgress(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplicationUpgradeProgress> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/$/GetUpgradeProgress';
      return this.get(this.getApiUrl(url), 'Get application upgrade progress', messageHandler);
  }

  public deleteApplication(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'Applications/' + encodeURIComponent(applicationId) + '/$/Delete';
      return this.post(this.getApiUrl(url), 'Application deletion', null, messageHandler);
  }

  public createComposeDeployment(composeDeploymentDescription: IRawCreateComposeDeploymentDescription, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'ComposeDeployments/$/Create';

      return this.put(this.getApiUrl(url, RestClientService.apiVersion60), 'Compose application creation', composeDeploymentDescription, messageHandler);
  }

  public deleteComposeApplication(applicationId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = 'ComposeDeployments/' + encodeURIComponent(applicationId) + '/$/Delete';
      return this.post(this.getApiUrl(url, RestClientService.apiVersion40), 'Compose application deletion', null, messageHandler);
  }

  public getPartitions(applicationId: string, serviceId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartition[]> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetPartitions';

      return this.getFullCollection<IRawPartition>(url, 'Get partitions', null, messageHandler);
  }

  public getPartition(applicationId: string, serviceId: string, partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartition> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId);

      return this.get(this.getApiUrl(url), 'Get partition', messageHandler);
  }

  public getPartitionById(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartition> {
      const url = 'Partitions/' + encodeURIComponent(partitionId);

      return this.get(this.getApiUrl(url, RestClientService.apiVersion60), 'Get partition by id', messageHandler);
  }

    public getServiceNameInfo(partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawServiceNameInfo> {
        const url = `Partitions/${partitionId}/$/GetServiceName`;

        return this.get(this.getApiUrl(url), 'Get service', messageHandler);
    }

    public getApplicationNameInfo(serviceId: string, messageHandler?: IResponseMessageHandler): Observable<IRawApplicationNameInfo> {
        const url = `Services/${serviceId}/$/GetApplicationName`;

        return this.get(this.getApiUrl(url), 'Get service', messageHandler);
    }

  public getPartitionHealth(applicationId: string, serviceId: string, partitionId: string,
                            eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                            replicasHealthStateFilter: number = HealthStateFilterFlags.Default,
                            messageHandler?: IResponseMessageHandler): Observable<IRawPartitionHealth> {

      const url = `Applications/${encodeURIComponent(applicationId)}/$/GetServices/${encodeURIComponent(serviceId)}/$/GetPartitions/${encodeURIComponent(partitionId)}`
          + `/$/GetHealth?EventsHealthStateFilter=${eventsHealthStateFilter}&ReplicasHealthStateFilter=${replicasHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get partition health', messageHandler);
  }

  public getPartitionLoadInformation(applicationId: string, serviceId: string, partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawPartitionLoadInformation> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId)
          + '/$/GetLoadInformation';

      return this.get(this.getApiUrl(url), 'Get partition load information', messageHandler);
  }

  public getReplicasOnPartition(applicationId: string, serviceId: string, partitionId: string, messageHandler?: IResponseMessageHandler): Observable<IRawReplicaOnPartition[]> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId)
          + '/$/GetReplicas';

      return this.getFullCollection<IRawReplicaOnPartition>(url, 'Get replicas on partition', null, messageHandler);
  }

  public getReplicaOnPartition(applicationId: string, serviceId: string, partitionId: string, replicaId: string, messageHandler?: IResponseMessageHandler): Observable<IRawReplicaOnPartition> {
      const url = 'Applications/' + encodeURIComponent(applicationId)
          + '/$/GetServices/' + encodeURIComponent(serviceId)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId)
          + '/$/GetReplicas/' + encodeURIComponent(replicaId);

      return this.get(this.getApiUrl(url), 'Get replica on partition', messageHandler);
  }

  public getReplicaHealth(applicationId: string, serviceId: string, partitionId: string, replicaId: string,
                          eventsHealthStateFilter: number = HealthStateFilterFlags.Default,
                          messageHandler?: IResponseMessageHandler): Observable<IRawReplicaHealth> {

      const url = `Applications/${encodeURIComponent(applicationId)}/$/GetServices/${encodeURIComponent(serviceId)}`
          + `/$/GetPartitions/${encodeURIComponent(partitionId)}/$/GetReplicas/${encodeURIComponent(replicaId)}`
          + `/$/GetHealth?EventsHealthStateFilter=${eventsHealthStateFilter}`;

      return this.get(this.getApiUrl(url), 'Get replica health', messageHandler);
  }

  public getReplicasOnNode(nodeName: string, applicationId: string, messageHandler?: IResponseMessageHandler): Observable<IRawDeployedReplica[]> {
      const url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetApplications/' + encodeURIComponent(applicationId)
          + '/$/GetReplicas';

      return this.get(this.getApiUrl(url), 'Get replicas on node', messageHandler);
  }

  public deleteReplica(nodeName: string, partitionId: string, replicaId: string, force?: boolean, messageHandler?: IResponseMessageHandler): Observable<{}> {
      let url = 'Nodes/' + encodeURIComponent(nodeName)
          + '/$/GetPartitions/' + encodeURIComponent(partitionId)
          + '/$/GetReplicas/' + encodeURIComponent(replicaId)
          + '/$/Delete';
      if (force) {
          url += '?ForceRemove=true';
      }
      return this.post(this.getApiUrl(url), 'Replica deletion', null, messageHandler);
  }

  public getImageStoreContent(path?: string, messageHandler?: IResponseMessageHandler): Observable<IRawImageStoreContent> {
      let url = path ? `ImageStore/${path}` : 'ImageStore';
      url += '?timeout=300';
      return this.get(this.getApiUrl(url, RestClientService.apiVersion60), 'Get Image Store content', messageHandler);
  }

  public deleteImageStoreContent(path: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      return this.delete(this.getApiUrl(`ImageStore/${path}`, RestClientService.apiVersion60), 'Delete Image Store content', messageHandler);
  }

  public getImageStoreFolderSize(path?: string, messageHandler?: IResponseMessageHandler): Observable<IRawStoreFolderSize> {
      let url = (path ? `ImageStore/${path}` : 'ImageStore') + '/$/FolderSize';
      url += '?timeout=300';

      return this.get(this.getApiUrl(url, RestClientService.apiVersion65), 'Get Image Store Folder Size', messageHandler);
  }

  public getClusterEvents(startTime: Date, endTime: Date, messageHandler?: IResponseMessageHandler): Observable<ClusterEvent[]> {
      return this.getEvents(ClusterEvent, 'EventsStore/Cluster/Events', startTime, endTime, messageHandler, RestClientService.apiVersion80);
  }

  public getNodeEvents(startTime: Date, endTime: Date, nodeName?: string, messageHandler?: IResponseMessageHandler): Observable<NodeEvent[]> {
      const url = 'EventsStore/'
          + 'Nodes/'
          + (nodeName ? (encodeURIComponent(nodeName) + '/$/') : '')
          + 'Events';
      return this.getEvents(NodeEvent, url, startTime, endTime, messageHandler);
  }

  public getApplicationEvents(startTime: Date, endTime: Date, applicationId?: string, messageHandler?: IResponseMessageHandler): Observable<ApplicationEvent[]> {
      const url = 'EventsStore/'
          + 'Applications/'
          + (applicationId ? (encodeURIComponent(applicationId) + '/$/') : '')
          + 'Events';
      return this.getEvents(ApplicationEvent, url, startTime, endTime, messageHandler);
  }

  public getServiceEvents(startTime: Date, endTime: Date, serviceId?: string, messageHandler?: IResponseMessageHandler): Observable<ServiceEvent[]> {
      const url = 'EventsStore/'
          + 'Services/'
          + (serviceId ? (encodeURIComponent(serviceId) + '/$/') : '')
          + 'Events';
      return this.getEvents(ServiceEvent, url, startTime, endTime, messageHandler);
  }

  public getPartitionEvents(startTime: Date, endTime: Date, partitionId?: string, messageHandler?: IResponseMessageHandler): Observable<PartitionEvent[]> {
      const url = 'EventsStore/'
          + 'Partitions/'
          + (partitionId ? (encodeURIComponent(partitionId) + '/$/') : '')
          + 'Events';
      return this.getEvents(PartitionEvent, url, startTime, endTime, messageHandler);
  }

  public getReplicaEvents(startTime: Date, endTime: Date, partitionId: string, replicaId?: string, messageHandler?: IResponseMessageHandler): Observable<ReplicaEvent[]> {
      const url = 'EventsStore/'
          + 'Partitions/'
          + encodeURIComponent(partitionId) + '/$/' + 'Replicas/'
          + (replicaId ? (encodeURIComponent(replicaId) + '/$/') : '')
          + 'Events';
      return this.getEvents(ReplicaEvent, url, startTime, endTime, messageHandler);
  }

  public getCorrelatedEvents(eventInstanceId: string, messageHandler?: IResponseMessageHandler): Observable<FabricEvent[]> {
      const url = 'EventsStore/'
          + 'CorrelatedEvents/'
          + encodeURIComponent(eventInstanceId) + '/$/'
          + 'Events';
      return this.getEvents(FabricEvent, url, null, null, messageHandler);
  }

  public getRepairTasks(messageHandler?: IResponseMessageHandler): Observable<IRawRepairTask[]> {
        const url = `$/GetRepairTaskList`;

        return this.get(this.getApiUrl(url, RestClientService.apiVersion60), 'Get repair tasks', messageHandler);
    }

  public restartReplica(nodeName: string, partitionId: string, replicaId: string, messageHandler?: IResponseMessageHandler): Observable<{}> {
      const url = `Nodes/${nodeName}/$/GetPartitions/${partitionId}/$/GetReplicas/${replicaId}/$/Restart`;

      return this.post(this.getApiUrl(url, RestClientService.apiVersion60), 'Restart replica', null, messageHandler);
  }

  public getClusterVersion(messageHandler?: IResponseMessageHandler): Observable<IRawClusterVersion> {
      const url = `$/GetClusterVersion`;

      return this.get(this.getApiUrl(url, RestClientService.apiVersion64), 'Get cluster version', messageHandler);
  }

  private getEvents<T extends FabricEventBase>(eventType: new () => T, url: string, startTime?: Date, endTime?: Date, messageHandler?: IResponseMessageHandler, apiVersion?: string): Observable<T[]> {
      let apiUrl = url;
      if (startTime && endTime) {
          apiUrl = apiUrl
              + '?starttimeutc=' + startTime.toISOString().substr(0, 19) + 'Z'
              + '&endtimeutc=' + endTime.toISOString().substr(0, 19) + 'Z';
      }

      if (!apiVersion) {
        apiVersion =  RestClientService.apiVersion72;
      }

      const fullUrl = this.getApiUrl(apiUrl, apiVersion, null, true);
      return this.get<IRawList<{}>>(fullUrl, null, messageHandler).pipe(map(response => {
          return new EventsResponseAdapter(eventType).getEvents(response);
        }));
  }

  /**
   * Appends apiVersion and a random token to aid in working with the brower's cache.
   * @param path The Input URI path.
   * @param apiVersion An optional parameter to specify the API Version.  If no API Version specified, defaults to "1.0"  This is due to the platform having independent versions for each type of call.
   */
  private getApiUrl(path: string, apiVersion = RestClientService.defaultApiVersion, continuationToken?: string, skipCacheToken?: boolean): string {
      if (!environment.production) {
          skipCacheToken = true;
      }
      // token to allow for invalidation of browser api call cache
      return StandaloneIntegration.clusterUrl +
          `/${path}${path.indexOf('?') === -1 ? '?' : '&'}api-version=${apiVersion ? apiVersion : RestClientService.defaultApiVersion}${skipCacheToken === true ? '' : `&_cacheToken=${this.cacheAllowanceToken}`}${continuationToken ? `&ContinuationToken=${continuationToken}` : ''}`;
  }

  // tslint:disable-next-line:max-line-length
  private getApiUrl2(path: string, apiVersion = RestClientService.defaultApiVersion, continuationToken?: string, skipCacheToken?: boolean, startDate?: Date, endDate?: Date, maxResults?: number, latest?: boolean): string {
      // token to allow for invalidation of browser api call cache
      const appUrl =  this.getApiUrl(path, apiVersion, continuationToken, false);
          // tslint:disable-next-line:max-line-length
      return appUrl + `${maxResults === undefined || maxResults === null ? '' : `&MaxResults=${maxResults}`}${(startDate === undefined || startDate === null || endDate === undefined || endDate === null) ? '' : `&StartDateTimeFilter=${startDate.toISOString().substr(0, 19)}Z&EndDateTimeFilter=${endDate.toISOString().substr(0, 19)}Z`}${latest === true ? `&Latest=True` : ''}`;
  }

  private getFullCollection<T>(url: string, apiDesc: string, apiVersion?: string, messageHandler?: IResponseMessageHandler, continuationToken?: string): Observable<T[]> {
      const appUrl = this.getApiUrl(url, apiVersion, continuationToken, false);
      return this.get<IRawCollection<T>>(appUrl, apiDesc, messageHandler).pipe(mergeMap(response => {
        if (response.ContinuationToken) {
            return this.getFullCollection<T>(url, apiDesc, apiVersion, messageHandler, response.ContinuationToken).pipe(mergeMap(items => {
                return of(response.Items.concat(items));
            }));
        }else{
            return of(response.Items);
        }
    //   }, err => {
    //     return [];
    }));

  }

    // tslint:disable-next-line:max-line-length
  private getFullCollection2<T>(url: string, apiDesc: string, apiVersion?: string, messageHandler?: IResponseMessageHandler, continuationToken?: string, startDate?: Date, endDate?: Date, maxResults?: number, latest?: boolean): Observable<T[]> {
      const appUrl = this.getApiUrl2(url, apiVersion, continuationToken, false, startDate, endDate, maxResults, latest);
      return this.get<IRawCollection<T>>(appUrl, apiDesc, messageHandler).pipe(mergeMap(response => {
          if (response.ContinuationToken) {
              return this.getFullCollection<T>(url, apiDesc, apiVersion, messageHandler, response.ContinuationToken).pipe(map(items => {
                  return response.Items.concat(items);
              }));
          }else{
            return of(response.Items);
          }
        }));
  }

  private generateGuidHeaders(): {guid: string, headers: HttpHeaders} {
    const guid = uuid4();
    return {guid, headers: new HttpHeaders().append(Constants.SfxRequestIdHeaderName, guid)};
  }

  private get<T>(url: string, apiDesc: string, messageHandler?: IResponseMessageHandler): Observable<T> {
    const headerInfo = this.generateGuidHeaders();
    const result = this.httpClient.get<T>(environment.baseUrl + url, {headers: headerInfo.headers});
    if (!messageHandler) {
          messageHandler = ResponseMessageHandlers.getResponseMessageHandler;
      }
    return this.handleResponse<T>(apiDesc, result as any, headerInfo.guid, messageHandler);
  }

  private post<T>(url: string, apiDesc: string, data?: any, messageHandler?: IResponseMessageHandler): Observable<T> {
      const headerInfo = this.generateGuidHeaders();
      const result = this.httpClient.post<T>(environment.baseUrl  + url, data, {headers: headerInfo.headers});
      if (!messageHandler) {
          messageHandler = ResponseMessageHandlers.postResponseMessageHandler;
      }
      return this.handleResponse<T>(apiDesc, result as any, headerInfo.guid, messageHandler);
  }

  private put<T>(url: string, apiDesc: string, data?: any, messageHandler?: IResponseMessageHandler): Observable<T> {
    const headerInfo = this.generateGuidHeaders();
    const result = this.httpClient.put<T>(environment.baseUrl  + url, data, {headers: headerInfo.headers});
    if (!messageHandler) {
          messageHandler = ResponseMessageHandlers.putResponseMessageHandler;
      }
    return this.handleResponse<T>(apiDesc, result as any, headerInfo.guid, messageHandler);
  }

  private delete<T>(url: string, apiDesc: string, messageHandler?: IResponseMessageHandler): Observable<T> {
    const headerInfo = this.generateGuidHeaders();
    const result = this.httpClient.delete<T>(environment.baseUrl  + url, {headers: headerInfo.headers});
    if (!messageHandler) {
          messageHandler = ResponseMessageHandlers.deleteResponseMessageHandler;
      }
    return this.handleResponse<T>(apiDesc, result as any, headerInfo.guid, messageHandler);
  }

  private handleResponse<T>(apiDesc: string, resultPromise: Observable<any>, guid: string, messageHandler?: IResponseMessageHandler): Observable<T> {
    const data: IRequest = {
        startTime: new Date().toISOString(),
        apiDesc,
        errorMessage: '',
        duration: 0,
        data: null,
        statusCode: 200,
        guid
    };
    return resultPromise.pipe(catchError((err: HttpErrorResponse) => {
        const header = `${err.status.toString()} : ${apiDesc}`;

        const message = messageHandler.getErrorMessage(apiDesc, err);
        let displayMessage = '';
        if (message) {
            displayMessage = message;
        }

        else if (err.error instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            displayMessage = err.error.message;

        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            displayMessage = err.message;
        }

        this.message.showMessage(displayMessage, MessageSeverity.Err, header);
        data.errorMessage = displayMessage;
        data.statusCode = err.status;
        // ...optionally return a default fallback value so app can continue (pick one)
        // which could be a default value (which has to be a HttpResponse here)
        // return Observable.of(new HttpResponse({body: [{name: "Default value..."}]}));
        // or simply an empty observable
        return throwError(err);
    }), finalize(() => {
        data.duration = new Date().getTime() - new Date(data.startTime).getTime();
        this.networkDebugger.addRequest(data);
     }));
    }
}

