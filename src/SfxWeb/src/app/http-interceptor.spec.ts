import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { httpInterceptorProviders } from './http-interceptor';
import { HttpClient } from '@angular/common/http';
import { DataService } from './services/data.service';
import { environment } from 'src/environments/environment';
import { AdalService } from './services/adal.service';
import { of } from 'rxjs';
import { AadMetadata } from './Models/DataModels/Aad';
import { Constants } from './Common/Constants';

describe('Http interceptors', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    const dataService: Partial<DataService> = { readOnlyHeader: null, clusterNameMetadata: 'old-name' };
    const adalService: Partial<AdalService> = {
        aadEnabled: false,
        acquireTokenResilient: (resource) => of('aad-token'),
        config: new AadMetadata({
            type: 'aad',
            metadata: {
                login: 'login',
                authority: 'auth',
                client: 'client-id',
                cluster: 'cluster-id',
                redirect: 'redirect',
                tenant: 'tenant-id'
            }
        })
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [httpInterceptorProviders,
                { provide: DataService, useValue: dataService },
                { provide: AdalService, useValue: adalService }]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
    });


    fit('readonly enabled', async () => {
        httpClient.get('/test').subscribe();

        const request = httpMock.expectOne('/test');

        const headers = {
            'SFX-Readonly': '1',
            'SFX-ClusterName': 'test-cluster'
        };
        request.flush(null, { headers });

        expect(dataService.readOnlyHeader).toBeTruthy();
        expect(dataService.clusterNameMetadata).toBe('test-cluster');
    });

    fit('readonly off', async () => {
        httpClient.get('/test').subscribe();

        const request = httpMock.expectOne('/test');

        const headers = { 'SFX-Readonly': '0' };
        request.flush(null, { headers });

        expect(dataService.readOnlyHeader).toBeFalsy();
    });

    fit('client headers sent', async () => {
        httpClient.get('/test').subscribe();

        const requests = httpMock.match({ method: 'get' });
        expect(requests[0].request.headers.get(Constants.SfxTelemetryMetadataName)).toBe(Constants.SfxTelemetryHeaderValue);
        expect(requests[0].request.headers.get(Constants.SfxBuildMetadataName)).toBe(environment.version);
    });

    fit('aad auth not enabled', async () => {
        adalService.aadEnabled = false;

        httpClient.get('/test').subscribe();

        const requests = httpMock.match({ method: 'get' });
        expect(requests[0].request.headers.get('Authorization')).toBeNull();
    });

    fit('aad auth enabled', async () => {
        adalService.aadEnabled = true;

        httpClient.get('/test').subscribe();

        const requests = httpMock.match({ method: 'get' });
        expect(requests[0].request.headers.get('Authorization')).toBe('Bearer aad-token');
    });



});
