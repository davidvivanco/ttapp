import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-search-modal-position-cards-position',
  templateUrl: './search-modal-position-cards.component.html'
})
export class SearchModalPositionCardsComponent implements OnInit {

  inputSearchGlobal: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SearchModalPositionCardsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private renderer: Renderer2) {
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
    this.dialogRef.close(this.inputSearchGlobal);
  }

  focusInput(el) {
    this.renderer.selectRootElement(el).focus();
  }

}
