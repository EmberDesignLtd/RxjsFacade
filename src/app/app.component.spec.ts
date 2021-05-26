import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { SecondComponent } from './second.component';
import { UserFacade } from './user.facade';
import { MockComponent } from 'ng-mocks';

const MOCK_VIEW_MODEL = {
  pagination: {
    currentPage: 0,
    selectedSize: 5,
    pageSizes: [5, 10, 20, 50],
  },
  criteria: 'ngDominican',
  users: [
    {
      gender: 'female',
      name: {
        title: 'Ms',
        first: 'Genesis',
        last: 'Lewis',
      },
    },
  ],
  loading: false,
};

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

const MockUserFacade = {
  getStateSnapshot: () => {
    return of(DEFAULT_STATE);
  },
  buildSearchTermControl: () => {
    const formControl = new FormControl();
    return formControl;
  },
  vm$: of(MOCK_VIEW_MODEL),
  updatePagination: () => {},
};

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, MockComponent(SecondComponent)],
      providers: [
        {
          provide: UserFacade,
          useValue: MockUserFacade,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updatePagination should', () => {
    it('update the pagination size when clicked', () => {
      spyOn(component, 'updatePagination').and.callThrough();
      spyOn(MockUserFacade, 'updatePagination');
      const updatePaginationButton = debugElement.query(
        By.css('#paginationButton')
      );
      updatePaginationButton.nativeElement.click();
      expect(component.updatePagination).toHaveBeenCalled();
      expect(MockUserFacade.updatePagination).toHaveBeenCalled();
    });
  });
});
