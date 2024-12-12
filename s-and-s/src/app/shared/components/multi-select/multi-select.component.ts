import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';
import { PlantService } from '../../service/plant.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css']
})
export class MultiSelectComponent implements OnInit {

  selectedItems = [];
  dropdownSettings = {};
  subscription: Subscription = new Subscription();
  unitList =[];
  disableDropdown: boolean = false;
  savedItems: any[] = [];
  @Input() allItems: any[] = [];
  @Input() type: string;
  @Output() itemSelected = new EventEmitter();

  constructor(private router: Router, private plantService: PlantService ,private dataService: DataService ,private snackbarService: SnackbarService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    ){
      this.router.events.subscribe((ev) => {
          this.subscription.unsubscribe();
      })
    }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'All',
      unSelectAllText: 'All',
      itemsShowLimit: 1,
    };
    this.selectAll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allItems'] && !changes['allItems'].firstChange) {
      this.selectedItems = this.allItems.map(key=>{return key.id});
      this.savedItems = this.selectedItems
    }
  }

  selectAll() {
    this.selectedItems = this.allItems.map(key=>{return key.id})
  }

  unselectAll() {
    this.selectedItems = [];
  }

  toggleCheckAll(values: any) {
    if(values.currentTarget.checked){
      this.selectAll();
    } else {
      this.unselectAll();
    }
  }

  onOpenDropDown(){
    this.savedItems = this.selectedItems
  }

  onCloseDropDown(){
    this.selectedItems = this.savedItems
  }

  selectList($event){
  }

  applyBtn(select: NgSelectComponent){
    this.savedItems = this.selectedItems
    select.close();
    this.itemSelected.emit(this.selectedItems)
  }

}
