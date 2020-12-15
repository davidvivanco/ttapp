import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html'
})
export class SearchModalComponent implements OnInit {

  inputSearchGlobal: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit() {
    this.focusInput('#searchInput');
  }

  onEnterKeyPress(val) {
    if (val && val !== '') this.searchGlobal();
  }

  closeModal() {
    this.dialogRef.close();
  }

  searchGlobal() {
    if (this.inputSearchGlobal.trim()) {
      this.router.navigate(['/resultados-de-busqueda'], { queryParams: { search: this.inputSearchGlobal } });
      this.inputSearchGlobal = '';
    }
    this.closeModal();
  }

  focusInput(el) {
    this.renderer.selectRootElement(el).focus();
  }

}
