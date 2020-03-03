import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IRawReplicatorStatus, IRawRemoteReplicatorStatus, IRemoteReplicatorAcknowledgementDetail, IRemoteReplicatorAcknowledgementStatus } from 'src/app/Models/RawDataTypes';
import { TimeUtils } from 'src/app/Utils/TimeUtils';

@Component({
  selector: 'app-replica-status',
  templateUrl: './replica-status.component.html',
  styleUrls: ['./replica-status.component.scss']
})
export class ReplicaStatusComponent implements OnInit, OnChanges {

  @Input() replicator: IRawRemoteReplicatorStatus;

  isCopying: boolean = false;
  isReplicating: boolean = false;
  
  replicationStatus: string = "";

  overallStatus: string = "";
  stepsFinished: number = 0;

  leftBannerColor: string = "";
  
  estimatedTime: string;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.isCopying = this.inProgress(this.replicator.RemoteReplicatorAcknowledgementStatus.CopyStreamAcknowledgementDetail);
    this.isReplicating = this.inProgress(this.replicator.RemoteReplicatorAcknowledgementStatus.ReplicationStreamAcknowledgementDetail);
    this.setCurrentStatus();

    this.replicationStatus = this.getReplicationStatus();
  }

  inProgress(details: IRemoteReplicatorAcknowledgementDetail): boolean {
    return (+details.NotReceivedCount + +details.ReceivedAndNotAppliedCount) > 0;
  }

  getReplicationStatus() {
    if(this.isCopying) {
      return 'Not Started';
    }
    
    if(this.isReplicating) {
      return this.estimatedTime;
    }
    return 'Complete';

  }

  setCurrentStatus() {
    this.leftBannerColor = "blue-border";

    if(this.isCopying) {
      this.overallStatus = 'Copying';
      this.estimatedTime = this.getEstimatedDuration(this.replicator.RemoteReplicatorAcknowledgementStatus.CopyStreamAcknowledgementDetail);
      this.stepsFinished = 0;
    } else if(this.isReplicating) {
      this.overallStatus = 'Replicating';
      this.estimatedTime = this.getEstimatedDuration(this.replicator.RemoteReplicatorAcknowledgementStatus.ReplicationStreamAcknowledgementDetail);
      this.stepsFinished = 1;
    } else {
      this.overallStatus = 'Complete';
      this.leftBannerColor = "green-border";
      this.stepsFinished = 2;
    }
  }

  getEstimatedDuration(details: IRemoteReplicatorAcknowledgementDetail) {
    //average apply duration * (received and not applied  +  not received) +  not received * average receive duration
    return TimeUtils.getDuration(+details.AverageApplyDuration * (+details.ReceivedAndNotAppliedCount + +details.NotReceivedCount) +
                                 +details.AverageReceiveDuration * +details.NotReceivedCount);
  }

}