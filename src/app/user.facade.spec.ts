import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UserFacade } from './user.facade';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';

const MOCK_USERS = {
  results: [
    {
      gender: 'female',
      name: {
        title: 'Ms',
        first: 'Genesis',
        last: 'Lewis',
      },
    },
  ],
};

const DEFAULT_STATE = {
  users: MOCK_USERS.results,
  criteria: 'ngDominican',
  pagination: {
    currentPage: 0,
    selectedSize: 5,
    pageSizes: [5, 10, 20, 50],
  },
  loading: false,
};

const USER_URL = 'https://randomuser.me/api/';

class HttpRequestInterceptorMock implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url && request.url.includes(USER_URL)) {
      return of(new HttpResponse({ status: 200, body: MOCK_USERS }));
    }
    return next.handle(request);
  }
}

describe('UserFacade', () => {
  let service: UserFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpRequestInterceptorMock,
          multi: true,
        },
      ],
    });
    service = TestBed.inject(UserFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStateSnapShot should', () => {
    it('return the default starting set state', () => {
      expect(service.getStateSnapshot()).toEqual(DEFAULT_STATE);
    });
    it('return the latest set state with the new pagination size of 10', () => {
      service.updatePagination(10);
      expect(service.getStateSnapshot().pagination.selectedSize).toEqual(10);
    });
    it('return the latest set state with the new search criteria of test', () => {
      service.updateSearchCriteria('test');
      expect(service.getStateSnapshot().criteria).toEqual('test');
    });
  });
});
