import { IRawInfrastructureJob } from '../RawDataTypes';
import { TimeUtils } from 'src/app/Utils/TimeUtils';
import { DataModelBase } from './Base';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusWarningLevel } from 'src/app/Common/Constants';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { DataService } from 'src/app/services/data.service';

export class InfrastructureJob extends DataModelBase<IRawInfrastructureJob> {

   public get id(): string {
       return this.raw.Id;
   }

   public ImpactAction: string = 'None' ;
   public AcknowlegementStatus: string = "WaitForStartStepAcknowlegement";


   constructor(public dataService: DataService, public raw: IRawInfrastructureJob, private dateRef: Date = new Date()) {
       super(dataService, raw);
       this.updateInternal();
   }

   updateInternal(): Observable<any> {
       this.ImpactAction = this.raw.ImpactAction; 
       this.AcknowlegementStatus = this.raw.AcknowledgementStatus;
       return of(null);
   }
}