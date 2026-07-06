import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutDialogComponent } from './about-dialog.component';

describe('AboutDialog', () => {
    let component: AboutDialogComponent;
    let fixture: ComponentFixture<AboutDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AboutDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AboutDialogComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
