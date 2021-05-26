import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  switchMap,
  debounceTime,
  take,
} from 'rxjs/operators';

export interface User {
  gender: string;
  name: {
    first: string;
    last: string;
  };
}

export interface Pagination {
  selectedSize: number;
  currentPage: number;
  pageSizes: number[];
}

export interface RandomUserResponse {
  results: User[];
}

export interface UserState {
  users: User[];
  pagination: Pagination;
  criteria: string;
  loading: boolean;
}

const USER_URL = 'https://randomuser.me/api/';

enum UserApiUrlParams {
  CURRENT_PAGE = 'page=',
  PAGE_SIZE = 'results=',
  SEARCH_FOR = 'seed=',
}

function buildUserUrl(criteria: string, pagination: Pagination): string {
  const currentPage = `${UserApiUrlParams.CURRENT_PAGE}${pagination.currentPage}`;
  const pageSize = `${UserApiUrlParams.PAGE_SIZE}${pagination.selectedSize}&`;
  const searchFor = `${UserApiUrlParams.SEARCH_FOR}${criteria}`;
  return `${USER_URL}?${searchFor}&${pageSize}&${currentPage}`;
}

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private state: UserState = {
    users: [],
    criteria: 'ngDominican',
    pagination: {
      currentPage: 0,
      selectedSize: 5,
      pageSizes: [5, 10, 20, 50],
    },
    loading: false,
  };
  private readonly store = new BehaviorSubject<UserState>(this.state);
  private readonly state$ = this.store.asObservable();
  readonly users$ = this.state$.pipe(
    map((state) => state.users),
    distinctUntilChanged()
  );
  readonly criteria$ = this.state$.pipe(
    map((state) => state.criteria),
    distinctUntilChanged()
  );
  readonly pagination$ = this.state$.pipe(
    map((state) => state.pagination),
    distinctUntilChanged()
  );
  readonly loading$ = this.state$.pipe(map((state) => state.loading));

  readonly vm$: Observable<UserState> = combineLatest([
    this.pagination$,
    this.criteria$,
    this.users$,
    this.loading$,
  ]).pipe(
    map(([pagination, criteria, users, loading]) => {
      return { pagination, criteria, users, loading };
    })
  );

  /**
   * This is the key change that I made to this service, the original didn't clean up it's internal subscription
   * simply refactored this method and the updateSearchCriteria and updatePagination methods to use take(1) to
   * prevent any subscriptions from leaking.
   */
  constructor(private http: HttpClient) {
    combineLatest([this.criteria$, this.pagination$])
      .pipe(
        take(1),
        switchMap(([criteria, pagination]) => {
          return this.findAllUsers(criteria, pagination);
        })
      )
      .subscribe((users) => {
        this.updateState({ ...this.state, users, loading: false });
      });
  }

  getStateSnapshot(): UserState {
    return { ...this.state, pagination: { ...this.state.pagination } };
  }

  buildSearchTermControl(): FormControl {
    const searchTerm = new FormControl();
    searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.updateSearchCriteria(value));
    return searchTerm;
  }

  updateSearchCriteria(criteria: string): void {
    this.findAllUsers(criteria, this.state.pagination)
      .pipe(take(1))
      .subscribe((users) =>
        this.updateState({ ...this.state, criteria, users, loading: true })
      );
  }

  updatePagination(selectedSize: number, currentPage: number = 0): void {
    const pagination = { ...this.state.pagination, currentPage, selectedSize };
    this.findAllUsers(this.state.criteria, pagination)
      .pipe(take(1))
      .subscribe((users) => {
        this.updateState({ ...this.state, pagination, users, loading: true });
      });
  }

  private updateState(state: UserState): void {
    this.store.next((this.state = state));
  }

  private findAllUsers(
    criteria: string,
    pagination: Pagination
  ): Observable<User[]> {
    const url = buildUserUrl(criteria, pagination);
    return this.http
      .get<RandomUserResponse>(url)
      .pipe(map((response) => response.results));
  }
}
