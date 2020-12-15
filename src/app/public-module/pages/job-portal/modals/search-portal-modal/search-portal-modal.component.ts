import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-search-portal-modal',
  templateUrl: './search-portal-modal.component.html'
})
export class SearchPortalModalComponent implements OnInit {
  inputSearch: string;

  constructor(
    public dialogRef: MatDialogRef<SearchPortalModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.focusInput('#searchInput');
  }

  focusInput(el) {
    this.renderer.selectRootElement(el).focus();
  }

  closeModal() {
    this.dialogRef.close();
  }

  onEnterKeyPress(val: string) {
    if (val && val !== '') this.doSearch();
  }

  doSearch() {
    this.dialogRef.close(this.inputSearch);
  }
}
