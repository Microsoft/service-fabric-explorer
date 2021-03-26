import { Component, OnInit, Injector } from '@angular/core';
import { BaseControllerDirective } from 'src/app/ViewModels/BaseController';
import { DataService } from 'src/app/services/data.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable } from 'rxjs';
import { ListColumnSetting, ListSettings, ListColumnSettingWithCustomComponent, ListColumnSettingWithUtcTime } from 'src/app/Models/ListSettings';
import { SettingsService } from 'src/app/services/settings.service';
import { RepairTaskViewComponent } from '../repair-task-view/repair-task-view.component';
import { RepairTask } from 'src/app/Models/DataModels/repairTask';
import { ITimelineData, EventStoreUtils } from 'src/app/Models/eventstore/timelineGenerators';
import { DataSet, DataGroup, DataItem } from 'vis-timeline';
import { RepairTaskCollection } from 'src/app/Models/DataModels/collections/RepairTaskCollection';
import { map } from 'rxjs/operators';
import { Counter } from 'src/app/Utils/Utils';

@Component({
  selector: 'app-repair-tasks',
  templateUrl: './repair-tasks.component.html',
  styleUrls: ['./repair-tasks.component.scss']
})
export class RepairTasksComponent extends BaseControllerDirective {
  public repairTaskCollection: RepairTaskCollection;

  tileText: any[] = [];
  tileText2: any[] = [];

  // used for timeline
  sortedRepairTasks: RepairTask[] = [];
  sortedCompletedRepairTasks: RepairTask[] = [];

  repairTaskListSettings: ListSettings;
  completedRepairTaskListSettings: ListSettings;

  timelineData: ITimelineData;

  constructor(private data: DataService, injector: Injector, private settings: SettingsService) {
    super(injector);
   }

  setup() {
    this.repairTaskCollection = this.data.repairCollection;

    this.repairTaskListSettings = this.settings.getNewOrExistingListSettings('repair', null,
      [
          new ListColumnSetting('raw.TaskId', 'TaskId'),
          new ListColumnSetting('raw.Action', 'Action', {enableFilter: true}),
          new ListColumnSetting('raw.Target.NodeNames', 'Target'),
          new ListColumnSetting('impactedNodes', 'Impact'),
          new ListColumnSetting('raw.State', 'State', {enableFilter: true}),
          new ListColumnSettingWithUtcTime('raw.History.CreatedUtcTimestamp', 'Created at'),
          new ListColumnSetting('displayDuration', 'Duration', {
            sortPropertyPaths: ['duration']
          }),
      ],
      [
        new ListColumnSettingWithCustomComponent(RepairTaskViewComponent,
          '',
          '',
          {
            enableFilter: false,
            colspan: -1
          })
    ],
      true,
      (item) => (Object.keys(item).length > 0),
      true);

    this.completedRepairTaskListSettings = this.settings.getNewOrExistingListSettings('completedRepair', null,
        [
            new ListColumnSetting('raw.TaskId', 'TaskId'),
            new ListColumnSetting('raw.Action', 'Action', {enableFilter: true}),
            new ListColumnSetting('raw.Target.NodeNames', 'Target'),
            new ListColumnSetting('impactedNodes', 'Impact'),
            new ListColumnSetting('raw.ResultStatus', 'Result Status', {enableFilter: true}),
            new ListColumnSettingWithUtcTime('raw.History.CreatedUtcTimestamp', 'Created at'),
            new ListColumnSetting('displayDuration', 'Duration', {
              sortPropertyPaths: ['duration']
            }),
        ],
        [
          new ListColumnSettingWithCustomComponent(RepairTaskViewComponent,
            '',
            '',
            {
              enableFilter: false,
              colspan: -1
            })
      ],
        true,
        (item) => true,
        true);
  }

  /*
  use boolean to share this function with both tables
  */
  sorted(items: RepairTask[], isCompletedSet: boolean = true) {
    isCompletedSet ? this.sortedCompletedRepairTasks = items : this.sortedRepairTasks = items;
    this.generateTimeLineData(this.sortedCompletedRepairTasks.concat(this.sortedRepairTasks));
  }

  generateTimeLineData(tasks: RepairTask[]) {
    const items = new DataSet<DataItem>();
    const groups = new DataSet<DataGroup>();

    tasks.forEach(task => {
        items.add({
          id: task.raw.TaskId,
          content: task.raw.TaskId,
          start: task.startTime ,
          end: task.inProgress ? new Date() : new Date(task.raw.History.CompletedUtcTimestamp),
          type: 'range',
          group: 'job',
          subgroup: 'stack',
          className: task.inProgress ? 'blue' : task.raw.ResultStatus === 'Succeeded' ? 'green' : 'red',
          title: EventStoreUtils.tooltipFormat(task.raw, new Date(task.raw.History.ExecutingUtcTimestamp).toLocaleString(),
                                                         new Date(task.raw.History.CompletedUtcTimestamp).toLocaleString()),
        });
    });

    groups.add({
      id: 'job',
      content: 'Job History',
      subgroupStack: {stack: true}
    });

    this.timelineData = {
      groups,
      items,
    };
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any> {
    return this.repairTaskCollection.refresh(messageHandler).pipe(map(() => {
      this.tileText2 = [];
      const counter = new Counter();
      this.repairTaskCollection.collection.forEach(task => {
        counter.add(task.raw.Action);
      });
      this.tileText2 = counter.mostCommon().slice(0, 3);

      this.tileText = [];
      const longRunningApprovalJob = this.repairTaskCollection.longRunningApprovalJob;
      if (longRunningApprovalJob) {
        this.tileText.push({
          primaryText: 'Approving',
          secondaryText: longRunningApprovalJob.id,
          topCorner: longRunningApprovalJob.displayDuration
        });
      }

      const longRunningExecutingRepairJob = this.repairTaskCollection.longestExecutingJob;
      if (longRunningExecutingRepairJob) {
        this.tileText.push({
          primaryText: 'Executing',
          secondaryText: longRunningExecutingRepairJob.id,
          topCorner: longRunningExecutingRepairJob.displayDuration
        });
      }
    }));
  }
}
