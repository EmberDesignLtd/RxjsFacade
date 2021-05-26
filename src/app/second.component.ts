import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserFacade, UserState } from './user.facade';

@Component({
  selector: 'app-second',
  templateUrl: './second.component.html',
  styleUrls: ['./second.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondComponent {
  searchTerm: FormControl;
  readonly vm$: Observable<UserState> = this.facade.vm$;

  constructor(private readonly facade: UserFacade) {
    const { criteria } = this.facade.getStateSnapshot();
    this.searchTerm = this.facade.buildSearchTermControl();
    this.searchTerm.patchValue(criteria, { emitEvent: false });
  }

  updatePagination(pageSize: number): void {
    this.facade.updatePagination(pageSize);
  }
}
