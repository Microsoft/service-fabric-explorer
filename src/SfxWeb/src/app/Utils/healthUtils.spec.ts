import { IUnhealthyEvaluationNode, getNestedNode, getParentPath, getLeafNodes, HealthUtils, HealthStatisticsEntityKind } from './healthUtils';
import { HealthEvaluation } from '../Models/DataModels/Shared';
import {
    IRawHealthEvaluation, IRawDeployedServicePackageHealthEvaluation, IRawNodeHealthEvluation,
    IRawApplicationHealthEvluation, IRawServiceHealthEvaluation, IRawPartitionHealthEvaluation, IRawReplicaHealthEvaluation, IRawServicesHealthEvaluation, IRawHealthEvent
} from '../Models/RawDataTypes';
import { DataService } from '../services/data.service';
import { ApplicationCollection } from '../Models/DataModels/collections/Collections';


describe('Health Utils', () => {

    describe('unhealthy tree', () => {

        let parent: IUnhealthyEvaluationNode;
        let child1: IUnhealthyEvaluationNode;
        let child2: IUnhealthyEvaluationNode;
        let nestedchild: IUnhealthyEvaluationNode;

        beforeEach((() => {
            parent = {
                healthEvaluation: {
                    treeName: '0',
                    viewPathUrl: '0',
                    healthState: { badgeClass: 'Ok', text: 'Ok', badgeId: 'ok' },
                } as HealthEvaluation,
                children: [],
                parent: null,
                containsErrorInPath: false,
                displayNames: [],
                id: 'root'
            };

            child1 = {
                healthEvaluation: {
                    treeName: '1',
                    viewPathUrl: '1',
                    healthState: { badgeClass: 'Ok', text: 'Ok', badgeId: 'ok' },
                } as HealthEvaluation,
                children: [],
                parent,
                containsErrorInPath: false,
                displayNames: [],
                id: 'child1'
            };

            child2 = {
                healthEvaluation: {
                    treeName: '2',
                    viewPathUrl: '2',
                    healthState: { badgeClass: 'Ok', text: 'Ok', badgeId: 'ok' },
                } as HealthEvaluation,
                children: [],
                parent,
                containsErrorInPath: false,
                displayNames: [],
                id: 'child2'
            };

            parent.children = [child1, child2];

            nestedchild = {
                healthEvaluation: {
                    treeName: '3',
                    viewPathUrl: '3',
                    healthState: { badgeClass: 'Ok', text: 'Ok', badgeId: 'ok' },
                } as HealthEvaluation,
                children: [],
                parent: child2,
                containsErrorInPath: false,
                displayNames: [],
                id: 'nestedchild'
            };

            child2.children = [nestedchild];
        }));

        describe('validate getNestedNode', () => {
            fit('validate getNestedNode no path', () => {
                const node = getNestedNode([], parent);
                expect(node).toEqual(parent);
            });

            fit('validate getNestedNode nested child', () => {
                const node = getNestedNode(['child2', 'nestedchild'], parent);
                expect(node).toEqual(nestedchild);
            });

            fit('validate getNestedNode no matching path', () => {
                const node = getNestedNode(['child3'], parent);
                expect(node).toBeNull();
            });
        });

        describe('validate getParentPath', () => {
            fit('validate getParentPath no parent', () => {
                const parents = getParentPath(parent);
                expect(parents.length).toEqual(0);
            });

            fit('validate getParentPath nested child', () => {
                const parents = getParentPath(nestedchild);
                expect(parents.length).toEqual(2);
                expect(parents[0]).toEqual(parent);
                expect(parents[1]).toEqual(child2);
            });
        });

        describe('validate getLeafNodes', () => {
            fit('validate getLeafNodes nested', () => {
                const nodes = getLeafNodes(nestedchild, false);
                expect(nodes.length).toEqual(1);

                const node = nodes[0];
                expect(node.displayNames.length).toEqual(2);
                expect(node.displayNames[0]).toEqual({
                    text: '0',
                    link: '0',
                    badge: 'Ok',
                    node: parent
                });

                expect(node.displayNames[1]).toEqual({
                    text: '2',
                    link: '2',
                    badge: 'Ok',
                    node: child2
                });

                expect(nestedchild.displayNames.length).toEqual(0);
            });

            fit('validate getLeafNodes nested skip root', () => {
                const nodes = getLeafNodes(nestedchild);
                expect(nodes.length).toEqual(1);

                const node = nodes[0];
                expect(node.displayNames.length).toEqual(1);
                expect(node.displayNames[0]).toEqual({
                    text: '2',
                    link: '2',
                    badge: 'Ok',
                    node: child2
                });
                expect(nestedchild.displayNames.length).toEqual(0);
            });
        });

        describe('validate getParentPath', () => {
            fit('validate getParentPath no parent', () => {
                const parents = getParentPath(parent);
                expect(parents.length).toEqual(0);
            });

            fit('validate getParentPath nested child', () => {
                const parents = getParentPath(nestedchild);
                expect(parents.length).toEqual(2);
                expect(parents[0]).toEqual(parent);
                expect(parents[1]).toEqual(child2);
            });
        });
    });

    describe('parsing health events', () => {

        let dataService: DataService;

        beforeEach((() => {
            dataService = {} as DataService;
        }));

        describe('getViewPathUrl', () => {
            fit('Nodes', () => {
                const health = {
                    Kind: 'Nodes'
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService);

                expect(data).toEqual({
                    viewPathUrl: '/nodes',
                    name: 'Nodes',
                    uniqueId: 'Nodes'
                });
            });

            fit('Node', () => {
                const health = {
                    Kind: 'Node',
                    NodeName: 'test'
                } as IRawNodeHealthEvluation;

                const data = HealthUtils.getViewPathUrl(health, dataService);

                expect(data).toEqual({
                    viewPathUrl: '/node/test',
                    name: 'test',
                    uniqueId: 'test'
                });
            });

            fit('Applications', () => {
                const health = {
                    Kind: 'Applications',
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService);

                expect(data).toEqual({
                    viewPathUrl: '/apps',
                    name: 'applications',
                    uniqueId: 'applications'
                });
            });

            fit('Application', () => {
                const health = {
                    Kind: 'Application',
                    ApplicationName: 'fabric:/test'
                } as IRawApplicationHealthEvluation;

                const apps = {
                    find: (name: string) => {
                        return {
                            raw: { TypeName: 'someType' }
                        };
                    }
                };
                dataService.apps = apps as ApplicationCollection;

                const data = HealthUtils.getViewPathUrl(health, dataService);

                expect(data).toEqual({
                    viewPathUrl: '/apptype/someType/app/test',
                    name: 'test',
                    uniqueId: 'fabric:/test'
                });
            });

            fit('Service user app', () => {
                const health = {
                    Kind: 'Service',
                    Description: 'Service \'fabric:/WordCountV1/WordCountWebService\' is in Warning.',
                    AggregatedHealthState: 'Warning',
                    ServiceName: 'fabric:/WordCountV1/WordCountWebService'
                } as IRawServiceHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent/service/WordCountV1%2FWordCountWebService',
                    name: 'WordCountV1/WordCountWebService',
                    uniqueId: 'WordCountV1/WordCountWebService'
                });
            });

            fit('Service system app', () => {
                const health = {
                    Kind: 'Service',
                    AggregatedHealthState: 'Warning',
                    ServiceName: 'fabric:/System%2FClusterManagerService'
                } as IRawServiceHealthEvaluation;
                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/apptype/System/app/System/service/System%252FClusterManagerService',
                    name: 'System%2FClusterManagerService',
                    uniqueId: 'System%2FClusterManagerService'
                });
            });

            fit('Partition', () => {
                const health = {
                    Kind: 'Partition',
                    PartitionId: '512361234123465'
                } as IRawPartitionHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent/partition/512361234123465',
                    name: '512361234123465',
                    uniqueId: '512361234123465'
                });
            });

            fit('Replica', () => {
                const health = {
                    Kind: 'Replica',
                    ReplicaOrInstanceId: '512361234123465'
                } as IRawReplicaHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent/replica/512361234123465',
                    name: '512361234123465',
                    uniqueId: '512361234123465'
                });
            });

            fit('Event', () => {
                const UnhealthyEvent: Partial<IRawHealthEvent> = {
                    SourceId: 'someId',
                    Property: 'Ok'
                };
                const health = {
                    Kind: 'Event',
                    UnhealthyEvent
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent',
                    name: 'Event',
                    uniqueId: 'someIdOk/parent'
                });
            });

            fit('DeployedServicePackage', () => {
                const health = {
                    Kind: 'DeployedServicePackage',
                    ServiceManifestName: 'manifest'
                } as IRawDeployedServicePackageHealthEvaluation;

                let data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent/deployedservice/manifest',
                    name: 'manifest',
                    uniqueId: 'manifest'
                });

                health.ServicePackageActivationId = '1234';
                data = HealthUtils.getViewPathUrl(health, dataService, '/parent');

                expect(data).toEqual({
                    viewPathUrl: '/parent/deployedservice/activationid/1234manifest',
                    name: 'manifest',
                    uniqueId: 'manifest'
                });

            });

            fit('DeployedServicePackages', () => {
                const health = {
                    Kind: 'DeployedServicePackages',
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');
                expect(data).toEqual({
                    viewPathUrl: '/parent',
                    name: 'DeployedServicePackages',
                    uniqueId: 'DSP/parent'
                });
            });
            fit('Partitions', () => {
                const health = {
                    Kind: 'Partitions',
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');
                expect(data).toEqual({
                    viewPathUrl: '/parent',
                    name: 'Partitions',
                    uniqueId: 'PP/parent'
                });
            });

            fit('Replicas', () => {
                const health = {
                    Kind: 'Replicas',
                } as IRawHealthEvaluation;

                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');
                expect(data).toEqual({
                    viewPathUrl: '/parent',
                    name: 'Replicas',
                    uniqueId: 'RR/parent'
                });
            });

            fit('Services', () => {
                const health = {
                    Kind: 'Services',
                    ServiceTypeName: 'testService'
                } as IRawServicesHealthEvaluation;

                health.ServiceTypeName = 'testService';
                const data = HealthUtils.getViewPathUrl(health, dataService, '/parent');
                expect(data).toEqual({
                    viewPathUrl: '/parent',
                    name: 'Services',
                    uniqueId: 'SStestService'
                });
            });
        });
    });


    describe('get health state count', () => {
        fit('getHealthStateCount valid', async () => {
            const data = {
                HealthEvents: [],
                AggregatedHealthState: 'Warning',
                UnhealthyEvaluations: [],
                HealthStatistics: {
                    HealthStateCountList: [
                        {
                            EntityKind: 'Node',
                            HealthStateCount: {
                                OkCount: 0,
                                ErrorCount: 1,
                                WarningCount: 5
                            }
                        },
                        {
                            EntityKind: 'Replica',
                            HealthStateCount: {
                                OkCount: 41,
                                ErrorCount: 6,
                                WarningCount: 0
                            }
                        },
                        {
                            EntityKind: 'Partition',
                            HealthStateCount: {
                                OkCount: 13,
                                ErrorCount: 5,
                                WarningCount: 0
                            }
                        },
                        {
                            EntityKind: 'Service',
                            HealthStateCount: {
                                OkCount: 4,
                                ErrorCount: 0,
                                WarningCount: 5
                            }
                        },
                        {
                            EntityKind: 'DeployedServicePackage',
                            HealthStateCount: {
                                OkCount: 22,
                                ErrorCount: 0,
                                WarningCount: 0
                            }
                        },
                        {
                            EntityKind: 'DeployedApplication',
                            HealthStateCount: {
                                OkCount: 16,
                                ErrorCount: 0,
                                WarningCount: 0
                            }
                        },
                        {
                            EntityKind: 'Application',
                            HealthStateCount: {
                                OkCount: 0,
                                ErrorCount: 0,
                                WarningCount: 4
                            }
                        }
                    ]
                },
                NodeHealthStates: [],
                ApplicationHealthStates: []
               };

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.Node)).toEqual({
                OkCount: 0,
                ErrorCount: 1,
                WarningCount: 5});
            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.Application)).toEqual({
                OkCount: 0,
                ErrorCount: 0,
                WarningCount: 4});
            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.Service)).toEqual({
                OkCount: 4,
                ErrorCount: 0,
                WarningCount: 5});

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.Partition)).toEqual({
                OkCount: 13,
                ErrorCount: 5,
                WarningCount: 0});

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.Replica)).toEqual({
                OkCount: 41,
                ErrorCount: 6,
                WarningCount: 0});

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.DeployedApplication)).toEqual({
                OkCount: 16,
                ErrorCount: 0,
                WarningCount: 0});
            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.DeployedServicePackage)).toEqual({
                OkCount: 22,
                ErrorCount: 0,
                WarningCount: 0});

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.DeployedServicePackage)).toEqual({
                OkCount: 22,
                ErrorCount: 0,
                WarningCount: 0});
        });

        fit('getHealthStateCount queried entity doesnt exist on list', async () => {
            const data = {
                HealthEvents: [],
                AggregatedHealthState: 'Warning',
                UnhealthyEvaluations: [],
                HealthStatistics: {
                    HealthStateCountList: [
                        {
                            EntityKind: 'Application',
                            HealthStateCount: {
                                OkCount: 0,
                                ErrorCount: 0,
                                WarningCount: 4
                            }
                        }
                    ]
                },
                NodeHealthStates: [],
                ApplicationHealthStates: []
               };

            expect(HealthUtils.getHealthStateCount(data, HealthStatisticsEntityKind.DeployedServicePackage)).toEqual({
                OkCount: 0,
                ErrorCount: 0,
                WarningCount: 0});
        });
    });
});

/*
Kind: "Services"
Description: "100% (1/1) services of service type 'WordCountWebServiceType' are unhealthy. The evaluation tolerates 0% unhealthy services for the service type."
AggregatedHealthState: "Warning"
ServiceTypeName: "WordCountWebServiceType"
UnhealthyEvaluations: [{,…}]
MaxPercentUnhealthyServices: 0
TotalCount: 1
*/
