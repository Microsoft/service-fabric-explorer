import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { IsolatedAction } from 'src/app/Models/Action';

@Component({
  selector: 'app-action-create-backup-policy',
  templateUrl: './action-create-backup-policy.component.html',
  styleUrls: ['./action-create-backup-policy.component.scss']
})
export class ActionCreateBackupPolicyComponent implements OnInit {

  form: FormGroup

  public date: string = "";
  public weekDay: string[]  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  isUpdateOperation: boolean = false;

  constructor(public dialogRef: MatDialogRef<ActionCreateBackupPolicyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IsolatedAction,
    private dataService: DataService,
    private formBuilder: FormBuilder) {        
  }

  public saveBackupPolicy() {
    let data = this.form.getRawValue();

    data.RetentionPolicy.MinimumNumberOfBackups = data.RetentionPolicy.MinimumNumberOfBackups.toString();

    if(!data.retentionPolicyRequired) {
      delete data.RetentionPolicy
    }
    delete data.retentionPolicyRequired;


    if(data.Schedule.ScheduleKind === "TimeBased" && data.Schedule.ScheduleFrequencyType === "Weekly") {
      data.Schedule.RunDays = data.Schedule.RunDays.map( (status: boolean, index: number ) => status ? this.weekDay[index] : null).filter( day => day !== null);
    }else{
      data.Schedule.RunDays = [];
    }

    (this.isUpdateOperation ? this.dataService.restClient.updateBackupPolicy(data) : 
                              this.dataService.restClient.createBackupPolicy(data)  ).subscribe( () => {
                                this.dialogRef.close();
                                this.data.data = data;
                              },
                              err => {
                                console.log(err)
                              });
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      Name: ["", [Validators.required]],
      AutoRestoreOnDataLoss: [false],
      MaxIncrementalBackups: [null, [Validators.required]],
      Schedule: this.formBuilder.group({
        ScheduleKind: ["FrequencyBased", [Validators.required]],
        ScheduleFrequencyType: [""],
        RunDays: this.getRunDaysControl(),
        RunTimes: this.formBuilder.array([]),
        Interval: [""]
      }),
      retentionPolicyRequired: [false],
      RetentionPolicy: this.formBuilder.group({
        RetentionPolicyType: ["Basic"],
        MinimumNumberOfBackups: [0],
        RetentionDuration: [null]
      })
    })

    if(this.data.data) {
        this.isUpdateOperation = true;
        this.form.patchValue(this.data.data);
        if(this.data.data.RetentionPolicy) {
          this.form.patchValue({'retentionPolicyRequired' : true});
        }

        this.form.get('Name').disable();
        if(this.data.data.Schedule.ScheduleFrequencyType === 'Weekly') {
          this.setDays(this.data.data.Schedule.RunDays);
        }
    }

    this.form.get('retentionPolicyRequired').valueChanges.subscribe(required => {
      this.form.get('RetentionPolicy').get('RetentionDuration').setValidators(required ? [Validators.required, Validators.minLength(1)] : null);
      this.form.get('RetentionPolicy').get('RetentionDuration').updateValueAndValidity();
    })

    this.form.get('Schedule').get('ScheduleKind').valueChanges.subscribe(type => {
      this.updateSchedule(type);
    })

    this.updateSchedule(this.form.get('Schedule').get('ScheduleKind').value);
  }

  updateSchedule(state: string) {
    this.form.get('Schedule').get('ScheduleFrequencyType').setValidators(state === 'TimeBased' ? [Validators.required] : null);
    this.form.get('Schedule').get('Interval').setValidators(state === 'FrequencyBased' ? [Validators.required] : null);

    this.form.get('Schedule').get('ScheduleFrequencyType').updateValueAndValidity();
    this.form.get('Schedule').get('Interval').updateValueAndValidity();  
  }

  get RunTimes() {
    return this.form.get(['Schedule', 'RunTimes']) as FormArray;
  }

  addRunTime() {
    this.RunTimes.push(this.formBuilder.control([this.date]))
    this.date = "";
  }

  removeRunTime(index: number) {
    this.RunTimes.removeAt(index);
  }

  getRunDaysControl() {
    const arr = this.weekDay.map(day => this.formBuilder.control(false)) // TODO set this with initial data
    return this.formBuilder.array(arr);
  }

  setDays(days: string[]) {
    const runDays = this.form.get(['Schedule', 'RunDays']) as FormArray;
    this.weekDay.forEach( (day, i) => {
      runDays.at(i).setValue(days.includes(day));
    })
  }

}
