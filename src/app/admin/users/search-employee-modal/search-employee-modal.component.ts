import { Component, Renderer2 } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'search-employee-modal',
    templateUrl: 'search-employee-modal.component.html'
})
export class SearchEmployeeModalComponent {
    search = new FormControl('', [Validators.required]);

    constructor(
        public dialogRef: MatDialogRef<SearchEmployeeModalComponent>,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.focusInput('#searchInput');
    }

    onEnterKeyPress(val) {
        if (val.value && val.value !== '') this.submit();
    }

    close(): void {
        this.dialogRef.close();
    }

    submit() {
        if (this.search.invalid) {
            return this.search.markAsTouched();
        }
        this.dialogRef.close(this.search.value);
    }

    getErrorMessage() {
        return 'Introduce un texto de búsqueda';
    }

    focusInput(el) {
        this.renderer.selectRootElement(el).focus();
    }

}
