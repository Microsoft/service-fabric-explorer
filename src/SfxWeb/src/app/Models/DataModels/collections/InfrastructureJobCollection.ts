import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusWarningLevel } from 'src/app/Common/Constants';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { DataService } from 'src/app/services/data.service';
import { IRawService } from '../../RawDataTypes';
import { InfrastructureJob } from '../infrastructureJob';
import { DataModelCollectionBase } from './CollectionBase';

export class InfrastructureJobCollection extends DataModelCollectionBase<InfrastructureJob>
{
    infrastructureJobs: InfrastructureJob[] = [];
    servicesList: IRawService[] = []
    infraJobs: InfrastructureJob[] =  [];


    public constructor(data: DataService) {
        super(data, parent);
    }

    protected retrieveNewCollection(messageHandler?: IResponseMessageHandler): Observable<any> {
        const dateRef = new Date();
        this.data.restClient.getServices('System',messageHandler).subscribe(systemServices =>this.servicesList = systemServices as IRawService[]);
        this.servicesList = this.servicesList.filter(service => service.Id.startsWith('System/InfrastructureService'));
        
        this.servicesList.forEach(service => {
            this.data.restClient.getInfrastructureJobs(service.Id, messageHandler).
                pipe(map(items => this.infraJobs.concat(items.map(raw => new InfrastructureJob(this.data, raw, dateRef)))))
            
        });
        return this.data.restClient.getInfrastructureJobs('System/InfrastructureService/Primary', messageHandler)
            .pipe(map(items => {
                return items.map(raw => new InfrastructureJob(this.data, raw, dateRef));
            }));
    }

    protected updateInternal(): Observable<any> {
        return of(null);
    }
    
}