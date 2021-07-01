import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-storage-form',
  templateUrl: './storage-form.component.html',
  styleUrls: ['./storage-form.component.scss']
})
export class StorageFormComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() data: any;
  @Input() required = true;

  localForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.localForm = this.formBuilder.group({
      StorageKind: ['', [Validators.required]],
      FriendlyName: [''],
      Path: [''],
      ConnectionString: [''],
      ContainerName: [''],
      BlobServiceUri: [''],
      ManagedIdentityType: [''],
      IsEmptyPrimaryCredential: [true],
      PrimaryUserName: [''],
      PrimaryPassword: [''],
      IsEmptySecondaryCredential: [true],
      SecondaryUserName: [''],
      SecondaryPassword: ['']
    });

    this.form.addControl('Storage', this.localForm);

    this.localForm.get('StorageKind').valueChanges.subscribe(storageKind => {
      if (this.required) {
        this.updateStorageKindValidators(this.localForm, storageKind);
      }
    });
    this.localForm.get('IsEmptyPrimaryCredential').valueChanges.subscribe(IsEmptyPrimaryCredential => {
      if (this.required) {
        this.updateStorageKindValidatorsPrimaryCredentials(this.localForm, IsEmptyPrimaryCredential);
      }
    });
    this.localForm.get('IsEmptySecondaryCredential').valueChanges.subscribe(IsEmptySecondaryCredential => {
      if (this.required) {
        this.updateStorageKindValidatorsSecondaryCredentials(this.localForm, IsEmptySecondaryCredential);
      }
    });
    // set default data or if none then give it a default state;
    this.data = this.data || {
      StorageKind: 'AzureBlobStore',
      FriendlyName: '',
      Path: '',
      ConnectionString: '',
      ContainerName: '',
      BlobServiceUri: '',
      ManagedIdentityType: '',
      IsEmptyPrimaryCredential: true,
      PrimaryUserName: '',
      PrimaryPassword: '',
      IsEmptySecondaryCredential: true,
      SecondaryUserName: '',
      SecondaryPassword: '',
    };
    this.localForm.patchValue(this.data);
    if (this.required) {
      this.localForm.get('ContainerName').setValidators(null);
      this.localForm.get('ConnectionString').setValidators(null);
      this.localForm.get('Path').setValidators(null);
    }
    else{
      this.localForm.get('StorageKind').setValidators(null);
      this.localForm.get('StorageKind').setValue('');
    }
  }

  updateStorageKindValidators(storage: AbstractControl, storageKind: string) {
    if (storageKind === 'AzureBlobStore') {
      storage.get('ContainerName').setValidators([Validators.required]);
      storage.get('ConnectionString').setValidators([Validators.required]);

      storage.get('Path').setValidators(null);
      this.updateStorageKindValidatorsPrimaryCredentials(storage, true);
      this.updateStorageKindValidatorsSecondaryCredentials(storage, true);

      storage.get('BlobServiceUri').setValidators(null);
      storage.get('ManagedIdentityType').setValidators(null);
    }

    if (storageKind === 'FileShare') {
      storage.get('ContainerName').setValidators(null);
      storage.get('ConnectionString').setValidators(null);

      storage.get('Path').setValidators([Validators.required]);
      storage.get('IsEmptyPrimaryCredential').setValue(false);
      storage.get('IsEmptySecondaryCredential').setValue(false);
      this.updateStorageKindValidatorsPrimaryCredentials(storage, false);
      this.updateStorageKindValidatorsSecondaryCredentials(storage, false);

      storage.get('BlobServiceUri').setValidators(null);
      storage.get('ManagedIdentityType').setValidators(null);
    }

    if(storageKind === 'ManagedIdentityAzureBlobStore')
    {
      storage.get('ConnectionString').setValidators(null);

      storage.get('Path').setValidators(null);
      this.updateStorageKindValidatorsPrimaryCredentials(storage, true);
      this.updateStorageKindValidatorsSecondaryCredentials(storage, true);

      storage.get('BlobServiceUri').setValidators([Validators.required]);
      storage.get('ManagedIdentityType').setValidators([Validators.required]);
      storage.get('ContainerName').setValidators([Validators.required]);
    }

    storage.get('ContainerName').updateValueAndValidity();
    storage.get('ConnectionString').updateValueAndValidity();
    storage.get('Path').updateValueAndValidity();
    storage.get('BlobServiceUri').updateValueAndValidity();
    storage.get('ManagedIdentityType').updateValueAndValidity();
  }

  updateStorageKindValidatorsPrimaryCredentials(storage: AbstractControl, IsEmptyPrimaryCredential: boolean) {
    if (IsEmptyPrimaryCredential)
    {
      storage.get('PrimaryUserName').setValidators(null);
      storage.get('PrimaryPassword').setValidators(null);
      storage.get('PrimaryUserName').setValue('');
      storage.get('PrimaryPassword').setValue('');
      storage.get('PrimaryUserName').disable();
      storage.get('PrimaryPassword').disable();
    }
    else
    {
      storage.get('PrimaryUserName').setValidators([Validators.required]);
      storage.get('PrimaryPassword').setValidators([Validators.required]);
      storage.get('PrimaryUserName').enable();
      storage.get('PrimaryPassword').enable();
    }
    storage.get('PrimaryUserName').updateValueAndValidity();
    storage.get('PrimaryPassword').updateValueAndValidity();
  }

  updateStorageKindValidatorsSecondaryCredentials(storage: AbstractControl, IsEmptySecondaryCredential: boolean) {
    if (IsEmptySecondaryCredential)
    {
      storage.get('SecondaryUserName').setValidators(null);
      storage.get('SecondaryPassword').setValidators(null);
      storage.get('SecondaryUserName').setValue('');
      storage.get('SecondaryPassword').setValue('');
      storage.get('SecondaryUserName').disable();
      storage.get('SecondaryPassword').disable();
    }
    else
    {
      storage.get('SecondaryUserName').setValidators([Validators.required]);
      storage.get('SecondaryPassword').setValidators([Validators.required]);
      storage.get('SecondaryUserName').enable();
      storage.get('SecondaryPassword').enable();
    }
    storage.get('SecondaryUserName').updateValueAndValidity();
    storage.get('SecondaryPassword').updateValueAndValidity();
  }
}
