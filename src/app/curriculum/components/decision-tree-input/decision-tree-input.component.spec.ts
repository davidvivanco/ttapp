import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionTreeInputComponent } from './decision-tree-input.component';

describe('DecisionTreeInputComponent', () => {
  let component: DecisionTreeInputComponent;
  let fixture: ComponentFixture<DecisionTreeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionTreeInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionTreeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
