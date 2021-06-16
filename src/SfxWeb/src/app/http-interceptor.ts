import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent, HTTP_INTERCEPTORS, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdalService } from './services/adal.service';
import { finalize, map, mergeMap } from 'rxjs/operators';
import { DataService } from './services/data.service';
import { Constants } from './Common/Constants';
import { environment } from 'src/environments/environment';

/*
The will intercept and allow the modification of every http request going in and out.
*/
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private adalService: AdalService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    if (this.adalService.aadEnabled){
        return this.adalService.acquireTokenResilient(this.adalService.config.raw.metadata.cluster)
        .pipe(mergeMap((token) => {
            if (token) {
            req = req.clone({
                setHeaders: {
                Authorization: 'Bearer ' + token
                }
            });
            }
            return next.handle(req);
        }));
    }else{
        return next.handle(req);
    }
  }
}


@Injectable()
export class ReadOnlyHeaderInterceptor implements HttpInterceptor {
  constructor(private dataService: DataService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
        return next.handle(req).pipe(map(res => {
            if (res instanceof HttpResponse) {
                if ( res.headers.has(Constants.SfxReadonlyHeaderName)) {
                    this.dataService.readOnlyHeader = res.headers.get(Constants.SfxReadonlyHeaderName) === '1';
                }

                if (res.headers.has(Constants.SfxClusterNameHeaderName)) {
                    this.dataService.clusterNameMetadata = res.headers.get(Constants.SfxClusterNameHeaderName);
                }

              }
            return res;
        }));
  }
}

@Injectable()
export class GlobalHeaderInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ADD ADDITIONAL HEADERS HERE
    const newHeaders = req.headers.append(Constants.SfxTelemetryMetadataName, Constants.SfxTelemetryHeaderValue)
                           .append(Constants.SfxBuildMetadataName, environment.version);

    return next.handle(req.clone({headers: newHeaders}));
 }
}


/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ReadOnlyHeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: GlobalHeaderInterceptor, multi: true },
];
