import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {

  @Input() totalRecords = 0;
    @Input() recordsPerPage = 0;

    @Output() onPageChange: EventEmitter<number> = new EventEmitter();

    public pages: any;
    activePage: number;
    temPages: number[];

  backArrowIcon = 'assets/images/leftarrow.svg';
  frontArrowIcon = 'assets/images/rightarrow.svg';
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(): any {
    const pageCount = this.getPageCount();
    this.pages = this.getArrayOfPage(pageCount);
    this.temPages = this.getArrayOfPage(pageCount);
    this.activePage = 1;
    this.onPageChange.emit(1);
    this.onClickPage(this.activePage)
  }

  private  getPageCount(): number {
    let totalPage = 0;

    if (this.totalRecords > 0 && this.recordsPerPage > 0) {
      const pageCount = this.totalRecords / this.recordsPerPage;
      const roundedPageCount = Math.floor(pageCount);

      totalPage = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
    }

    return totalPage;
  }

  private getArrayOfPage(pageCount: number): number [] {
    const pageArray = [];

    if (pageCount > 0) {
        for(let i = 1 ; i <= pageCount ; i++) {
          pageArray.push(i);
        }
    }

    return pageArray;
  }

  // onClickPage(pageNumber: number): void {
  //     if (pageNumber >= 1 && pageNumber <= this.pages.length) {
  //         this.activePage = pageNumber;
  //         this.onPageChange.emit(this.activePage);
  //     }
  // }
  onClickPage(pageNumber: any): void {
    if(pageNumber != '...'){
      if (pageNumber >= 1 && pageNumber <= this.temPages.length) {
        this.activePage = pageNumber;
        this.onPageChange.emit(this.activePage);
    }

    if(this.temPages.length > 4 ){
      this.pages = [];
      if(pageNumber >= 1 && pageNumber < 4){
        this.pages.push(1)
        this.pages.push(2)
        this.pages.push(3)
        this.pages.push(4)
        this.pages.push('...')
        this.pages.push(this.temPages[this.temPages.length - 1])
      }else if(pageNumber >= 4 && pageNumber < this.temPages[this.temPages.length - 3]){
        this.pages.push(1)
        this.pages.push('...')
        this.pages.push(pageNumber - 1)
        this.pages.push(pageNumber)
        this.pages.push(pageNumber + 1)
        this.pages.push('...')
        this.pages.push(this.temPages[this.temPages.length - 1])
      }else if(pageNumber >= this.temPages[this.temPages.length - 3] && pageNumber < this.temPages[this.temPages.length - 2]){
        this.pages.push(1)
        this.pages.push('...')
        this.pages.push(pageNumber - 1)
        this.pages.push(pageNumber)
        this.pages.push(pageNumber + 1)
        this.pages.push(this.temPages[this.temPages.length - 1])
      }else if(pageNumber == this.temPages[this.temPages.length - 2]){
        this.pages.push(1)
        this.pages.push('...')
        this.pages.push(pageNumber - 2)
        this.pages.push(pageNumber - 1)
        this.pages.push(pageNumber)
        this.pages.push(pageNumber + 1)
      }else if(pageNumber == this.temPages[this.temPages.length - 1]){
        this.pages.push(1)
        this.pages.push('...')
        this.pages.push(pageNumber - 3)
        this.pages.push(pageNumber - 2)
        this.pages.push(pageNumber - 1)
        this.pages.push(pageNumber)
      }
    }
    }




  }}
