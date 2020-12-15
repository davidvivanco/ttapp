import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-search-modal-roles',
  templateUrl: './search-modal-roles.component.html'
})
export class SearchModalRolesComponent implements OnInit {

  inputSearchGlobal: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SearchModalRolesComponent>,
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
      this.router.navigate(['/roles'], { queryParams: { search: this.inputSearchGlobal } });
      this.inputSearchGlobal = '';
    }
    this.closeModal();
  }

  focusInput(el) {
    this.renderer.selectRootElement(el).focus();
  }

}
