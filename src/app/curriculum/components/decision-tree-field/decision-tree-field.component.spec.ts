import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionTreeFieldComponent } from './decision-tree-field.component';

describe('DecisionTreeFieldComponent', () => {
  let component: DecisionTreeFieldComponent;
  let fixture: ComponentFixture<DecisionTreeFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionTreeFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionTreeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
