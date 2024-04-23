import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmanageCategoryComponent } from './cmanage-category.component';

describe('CmanageCategoryComponent', () => {
  let component: CmanageCategoryComponent;
  let fixture: ComponentFixture<CmanageCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmanageCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CmanageCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
