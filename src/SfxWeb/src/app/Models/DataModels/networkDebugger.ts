import { Utils } from 'src/app/Utils/Utils';

export interface IRequest {
    errorMessage: string;
    statusCode: number;
    startTime: string;
    duration: number;
    data: any;
    apiDesc: string;
    guid: string;
}

export interface IRequestsData {
    apiDesc: string;
    failureRate: string;
    failureCount: number;
    requestCount: number;
    averageDuration: number;
    requests: IRequest[];
    isSecondRowCollapsed: boolean;
    isSlowOrUnresponsive: boolean;
}


export class NetworkDebugger {
    public slowOrResponsiveNetwork = false;
    public stopRecordingRequests = false;
    public overall: IRequestsData;
    public maxRequests = 10;
    public slowAverageResponse = 100;


    individualRequests: Record<string, IRequestsData> = {};
    public requestsMap: IRequestsData[] = [];

    constructor() {
        this.clear();
    }

    clear() {
        this.requestsMap = [];
        this.individualRequests = {};
        this.overall = {
            apiDesc: 'overall',
            failureRate: '',
            failureCount: 0,
            requestCount: 1,
            averageDuration: 0,
            requests: [],
            isSecondRowCollapsed: true,
            isSlowOrUnresponsive: false
        };
    }

    addRequest(data: IRequest) {
        if (this.stopRecordingRequests) {
            return;
        }
        // add to overall list
        const individualRequests = this.individualRequests[data.apiDesc] || {
            apiDesc: data.apiDesc,
            failureRate: '',
            failureCount: 0,
            requestCount: 1,
            averageDuration: 0,
            requests: [],
            isSecondRowCollapsed: true
        } as IRequestsData;

        Utils.addToArrayAndTrim(individualRequests.requests, data, this.maxRequests,
            (item) => {
                if (item.errorMessage) {
                    individualRequests.failureCount--;
                }
            },
            (item) => {
                if (item.errorMessage) {
                    individualRequests.failureCount++;
                }
                const failureRate = (individualRequests.failureCount / individualRequests.requests.length) * 100;
                individualRequests.failureRate = failureRate.toFixed(0) + '%';
                individualRequests.averageDuration = +(individualRequests.requests.reduce((sum, request) => sum += request.duration, 0) / individualRequests.requests.length).toFixed(0);
                individualRequests.isSlowOrUnresponsive = this.slowAverageResponse < individualRequests.averageDuration || failureRate > 30;
            });

        individualRequests.requestCount = individualRequests.requests.length;

        this.individualRequests[data.apiDesc] = individualRequests;

        if (individualRequests.requestCount === 1) {
            this.requestsMap.push(individualRequests);
        }

        Utils.addToArrayAndTrim(this.overall.requests, data, this.maxRequests,
            (item) => {
                if (item.errorMessage) {
                    this.overall.failureCount--;
                }
            },
            (item) => {
                if (item.errorMessage) {
                    this.overall.failureCount++;
                }
                this.overall.failureRate = (this.overall.failureCount / this.overall.requests.length * 100).toFixed(0) + '%';
                this.overall.averageDuration = +(this.overall.requests.reduce((sum, request) => sum += request.duration, 0) / this.overall.requests.length).toFixed(0);
                this.overall.isSlowOrUnresponsive = this.requestsMap.some( requests => requests.isSlowOrUnresponsive);

            });
    }
}
