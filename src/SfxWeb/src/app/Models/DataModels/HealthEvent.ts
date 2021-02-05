import { DataModelBase } from './Base';
import { IRawHealthEvent, IRawHealth } from '../RawDataTypes';
import { DataService } from 'src/app/services/data.service';
import { TimeUtils } from 'src/app/Utils/TimeUtils';
import { IHealthStateChunk } from '../HealthChunkRawDataTypes';
import { HealthEvaluation } from './Shared';
import { Observable, of } from 'rxjs';
import { CollectionUtils } from 'src/app/Utils/CollectionUtils';
import { HealthUtils } from 'src/app/Utils/healthUtils';
import { map, tap } from 'rxjs/operators';

export class HealthEvent extends DataModelBase<IRawHealthEvent> {
    public constructor(data: DataService, raw: IRawHealthEvent) {
        super(data, raw);
    }

    public get uniqueId(): string {
        return `${this.raw.SourceId}_${this.raw.Property}_${this.raw.SequenceNumber}`;
    }

    public get description(): string {
        return this.raw.Description.trim();
    }

    public get sourceUtcTimestamp(): string {
        return TimeUtils.timestampToUTCString(this.raw.SourceUtcTimestamp);
    }

    public get TTL(): string {
        return TimeUtils.getDuration(this.raw.TimeToLiveInMilliSeconds);
    }
}

export class HealthBase<T extends IRawHealth> extends DataModelBase<T> {
    public healthEvents: HealthEvent[] = [];
    public unhealthyEvaluations: HealthEvaluation[] = [];

    public constructor(data: DataService, parent?: any) {
        // Use {} instead of null because health information may be merged into this object
        // before the object gets fully refreshed from server.
        super(data, {} as T, parent);
    }

    public mergeHealthStateChunk(healthChunk: IHealthStateChunk): Observable<any> {
        this.raw.AggregatedHealthState = healthChunk.HealthState;
        return of(true);
    }

    protected updateInternal(): Observable<any> | void {
        this.parseCommonHealthProperties().subscribe();
    }

    protected parseCommonHealthProperties(): Observable<any> {
        const healthEvents = this.raw.HealthEvents.map(rawHealthEvent => new HealthEvent(this.data, rawHealthEvent as IRawHealthEvent));
        this.healthEvents = CollectionUtils.updateDataModelCollection(this.healthEvents, healthEvents);
        // There is no unique ID to identify the unhealthy evaluations collection, update the collection directly.
        // Make sure that the apps are initialized because some of the parsedHealth Evaluations need to reference the app's collection and that needs to be set.
        return this.data.apps.ensureInitialized().pipe(map( () => {
            this.unhealthyEvaluations = HealthUtils.getParsedHealthEvaluations(this.raw.UnhealthyEvaluations, 0, null, this.data);
        }));
    }
}
