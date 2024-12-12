import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { concat } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { IssuesService } from 'src/app/shared/services/issues.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
declare var $: any;

import Fuse from 'fuse.js'


@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit, OnDestroy {
  ColumnMode = ColumnMode;
  selectionType = SelectionType;
  dropdownSettings: IDropdownSettings;
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;
  recordRows: any[] = []
  recordColumns: any[] = []
  selectedPage: any = '';
  issueCreate: any;
  isRouteClicked: boolean = false;
  filterStatus = ["open", "closed"]
  statusFilter: any = [];
  fromDateFliter: any = '';
  toDateFliter: any = '';
  showRelatedIssueData: boolean = false;
  issueRelatedChat: boolean = false;
  issueRelatedData: boolean = false;
  issuesList: any[] = []
  selected: any[] = []
  rowId: any;
  rowsLimit: any;
  unitsList: any[] = []
  selectedUnit_id: any;
  issue_number: any;
  equipmentCategory: any[] = [];
  equipmentCategoryFilter: any;
  equipment_Category: any[] = [];
  equipmentList: any[] = [];
  equipmentFilter: any;
  escalated: any[] = [
    { id: true, name: 'Escalated' },
    { id: false, name: 'Non-escalated' }
  ]
  escalated_BooleanValue: any;
  critical: any[] = [
    { id: true, name: 'Critical' },
    { id: false, name: 'Non-critical' }
  ]
  critical_BooleanValue: any;
  notificationCategories: any[] = [
    { id: 1, name: 'Inspection' },
    { id: 2, name: 'Scaffolding' },
    { id: 3, name: 'Lighting' },
    { id: 4, name: 'Safety' },
    { id: 5, name: 'Maintenance' },
    { id: 6, name: 'Electrical' },
    { id: 7, name: 'Others' }
  ]
  critValue: boolean;
  escValue: boolean;
  selectedCategory: any;
  selectPage: any;
  msg: string;
  departmentList: any[] = []
  department_id: any;
  selectedIssue: any;
  issue_types_list: any = [];
  issue_type_id: any;
  issueTypeIds: any[] = [];
  selectedUnitName: any;
  Obj: any;
  params: any[] = [];
  par: any;
  val: any;
  searchText: string = '';
  validateUser: any;
  allUsersList: any;
  loginUserEmail: string;
  loginUserId: any;
  equipments: any[] = [];
  screenHeight: number = 0;
  noOfRows: number = 0;
  activePage: number = 0;
  issuesLength: number = 0;
  startIndex: any;
  endIndex: any;
  offset: number;
  noTempOfRows: number;
  filteredCall: boolean = false;
  parameter: any;
  constructor(private router: Router, private route: ActivatedRoute, private issuesService: IssuesService, private commonService: CommonService, private dataService: DataService, private snackbarService: SnackbarService) {
  }
  ngOnInit(): void {
    this.parameter = JSON.parse(sessionStorage.getItem('navigatingToIssue'))
    this.escalated_BooleanValue = null
    this.critical_BooleanValue = null
    this.issuesService.getUserList().subscribe({
      next: (data: any) => {
        this.allUsersList = data;
        console.log('allUsersList ', this.allUsersList)
        this.allUsersList.forEach(element => {
          let userMail = sessionStorage.getItem('user-email');
          this.loginUserEmail = userMail
          if (element.email == userMail) {
            this.loginUserId = element.id
          }
        })
        // this.users_list.forEach((val, ind) => {
        //   this.emailIds.push(val.email)
        // })
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })

    var w = window.innerWidth;
    var h = window.innerHeight;
    this.rowsLimit = Math.floor(h / 60);
    this.selectedUnit_id = null
    this.department_id = null
    this.issue_number = null
    this.params = null
    this.par = null
    // console.log(this.router.getCurrentNavigation()?.extras?.state)
    // this.route.queryParams.subscribe(params => {
    //   console.log(params)
    //   if (params?.unit_id && params?.department_id && params?.issue_number) {
    //     this.router.navigate(['schedule-control/issues'], {skipLocationChange: true});
    //     this.selectedUnit_id = params?.unit_id
    //     this.department_id = params?.department_id
    //     this.issue_number = params?.issue_number
    //     this.selectedPage = 'allIsuues'
    //   }
    // });

    this.params = JSON.parse(sessionStorage.getItem('navigatingToIssue'))
    // let param = JSON.parse(sessionStorage.getItem('issuesNavigationFilter'))
    this.par = JSON.parse(sessionStorage.getItem('navigateToAllIssues'))
    // this.val = JSON.parse(sessionStorage.getItem('navigateToAllIssuesCount'))
    console.log(this.params)
    if (!sessionStorage.getItem('storeSeletedPage')) {
      this.selectedPage = 'myIsuues'
    }
    // else if(param.escalated == true){
    //   this.selectedPage = 'allIsuue'
    //   this.issuesService.getIssuesList(this.selectedUnit_id, this.department_id, '', '','', '','', true,true)
    //   this.escalated_BooleanValue = true
    //   this.getMyIssues()
    // }
    // else if(this.params.critical == true){
    //   this.selectedPage = 'allIsuues'
    //   this.escalated_BooleanValue = true
    //   this.critical_BooleanValue = true
    //   this.getMyIssues()
    // }
    else {
      this.selectedPage = sessionStorage.getItem('storeSeletedPage')
    }
    //
    console.log(JSON.stringify(this.params))
    if (this.params != null) {
      this.critical_BooleanValue = false
      this.escalated_BooleanValue = false
      for (var i = 0; i < this.params.length; i++) {
        console.log(this.params[i].unit_id);
        this.selectedUnit_id = this.params[i]?.unit_id
        // this.department_id = (typeof (this.params[i]?.department_id) === 'number') ? this.params[i]?.department_id : null;
        this.issue_number = this.params[i]?.issue_number
      }
      if (this.selectedUnit_id && this.issue_number) {
        // this.selectedPage = 'allIsuues'
        // this.selectedPage = sessionStorage.setItem('storeSeletedPage', 'allIsuues')
        console.log(this.params)
        this.getUnitsList()
      }

    }
    if (this.par) {

      // this.filteredCall = true
      this.critical_BooleanValue = this.par.critical
      this.escalated_BooleanValue = this.par.escalated
      this.issueTypeIds = this.par.status

      this.selectedUnit_id = JSON.parse(sessionStorage.getItem('selectedUnit')).id
      // sessionStorage.setItem('navigateToAllIssues', null);
      this.getUnitsList()
    }
    // else if(this.val){
    //   this.statusFilter = this.val.status
    //   this.selectedUnit_id = JSON.parse(sessionStorage.getItem('selectedUnit')).id
    //   this.getUnitsList()
    // }
    // else if(this.val != null || []){
    //   this.statusFilter = this.val.status
    //   this.selectedUnit_id = JSON.parse(sessionStorage.getItem('selectedUnit')).id
    //   this.getUnitsList()
    // }
    else {
      this.selectedUnit_id = null
      this.department_id = null
      this.issue_number = null
      // this.params = null
      console.log("hello >>>>>>>>>>>>>>>")
      this.getUnitsList()
    }

    this.dropdownSettings = {
      // singleSelection: false,
      idField: 'id',
      textField: 'name',
      enableCheckAll: false,
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.selectedCategory = this.notificationCategories[0]?.id
    console.log(this.selected)
  }

  ngOnChanges() {

    console.log('onngoinit')
  }

  onRouteClicked() {
    setTimeout(() => {
      this.isRouteClicked = !this.isRouteClicked
      if (this.isRouteClicked == true) {
        this.getIssueStatus()
        // this.getEquipmentCategories()
        if (this.equipmentCategoryFilter) {
          this.getEquipments()
        }
        else {
          this.equipmentFilter = null
        }
        // this.critical_BooleanValue = null
        // this.escalated_BooleanValue = null
      }
      else if (this.isRouteClicked == false) {
        // this.filterReset()
        this.fromDateFliter = ''
        this.toDateFliter = ''
        this.statusFilter = []
        this.issueTypeIds = []
        // this.getTotalcount();
        this.getEquipmentCategories();
        this.critical_BooleanValue = null
        this.escalated_BooleanValue = null
      }
    }, 200)
  }
  getSelectedPage(pageName: string) {
    this.parameter = []
    this.fromDateFliter = ''
    this.toDateFliter = ''
    this.statusFilter = []
    this.issueTypeIds = []
    // this.getTotalcount();
    this.getEquipmentCategories();
    this.critical_BooleanValue = null
    this.escalated_BooleanValue = null
    this.issue_number = null
    this.selectedPage = pageName
    this.offset = 0
    this.activePage = 1
    sessionStorage.setItem('storeSeletedPage', pageName)
    this.getTotalcount()
  }

  getReleatedIssueData() {
    this.showRelatedIssueData = !this.showRelatedIssueData;
  }
  filterIssues() {

  }
  filterReset() {
    this.fromDateFliter = ''
    this.toDateFliter = ''
    this.statusFilter = []
    this.issueTypeIds = []
    this.getTotalcount();
    this.getEquipmentCategories();
    this.critical_BooleanValue = null
    this.escalated_BooleanValue = null
  }
  onSelect(data: any) {
    if (this.rowId !== this.selected[0]['id']) {
      this.selectedIssue = data?.selected[0]
      this.showRelatedIssueData = false;
      this.issueRelatedChat = false;
    }
    this.rowId = this.selected[0]['id']
  }
  showIssueRelatedChat() {
    this.issueRelatedChat = !this.issueRelatedChat
  }
  showIssueRelatedData() {
    this.issueRelatedData = !this.issueRelatedData
  }
  onDataChange(data: boolean) {
    console.log('data ', data)
    this.issueRelatedData = data
  }
  closeChatBox(data: boolean) {
    this.issueRelatedChat = data
  }
  getSelectedCategory(id) {
    this.selectedCategory = id
  }
  getUnitsList() {
    this.dataService.passSpinnerFlag(true, true)
    this.commonService.getUnitsList().subscribe({
      next: (data: any) => {
        this.unitsList = data.sort((a, b) => { return a.order - b.order });
        console.log(this.unitsList)
        // if (this.selectedUnit_id == null) {
        //   this.selectedUnit_id = this.unitsList?.[0]?.id
        // }
        this.selectedUnit_id = this.unitsList.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0]?.id || this.unitsList[0]?.id;
        // if(this.filteredCall){

        this.getDepartmentsList();
        this.getIssuesList();

        console.log(this.selectedUnit_id)
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getDepartmentsList() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getDepartmentsList().subscribe({
      next: (data: any) => {
        this.departmentList = data;
        console.log('getIssuesList ', this.departmentList)
        if (this.department_id == null) {
          this.department_id = 'null'
          // this.department_id = this.departmentList?.[0]?.id
        }
        this.getTotalcount()
        this.getEquipmentCategories()

      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }

  getEquipmentCategories() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getEquipmentCategories(this.selectedUnit_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.equipmentCategory = data
          // this.equipmentCategory.unshift({id:'',name:'Filter by Equipment Category'})
          // this.equipmentCategoryFilter = this.equipmentCategory?.[0].id

          this.equipmentCategoryFilter = null
          console.log(this.equipmentCategoryFilter)
          if (this.equipmentCategoryFilter) {
            this.getEquipments()
          }

        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getEquipments() {
    this.issuesService.getEquipments(this.equipmentCategoryFilter).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.equipmentList = data
          // this.equipmentFilter.unshift({id:'',name:'Filter by Equipment'})
          this.equipmentFilter = this.equipmentList?.[0].id
          this.equipmentFilter.id = null
          console.log(this.equipmentFilter)
        }
        else {
          this.equipmentList = []
          this.dataService.passSpinnerFlag(false, true);
        }
      },
      error: () => {
        this.equipmentList = []
        this.equipmentFilter = null
        this.equipmentFilter.id = null
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  searchWithFuse() {
    // if(this.searchText != '') {
    //   this.getIssuesList()
    //   const options = {
    //     includeScore: false,
    //     keys: ['department', 'equipment_name', 'issue_category_name', 'task_name', 'issue_number']
    //   }
    //   // this.issuesList = data;
    //   const fuse = new Fuse(this.issuesList, options)
    // } else {
    const options = {
      includeScore: false,
      keys: ['department', 'equipment_name', 'issue_category_name', 'task_name', 'issue_number']
    }
    // this.issuesList = data;
    const fuse = new Fuse(this.issuesList, options)
    console.log(fuse.search(this.searchText, { limit: 5 }))
    this.issuesList = fuse.search(this.searchText, { limit: 5 }).map(item => item.item)
    this.selected = [this.issuesList[0]]
    this.rowId = this.selected[0]['id']
    this.selectedIssue = this.selected[0];
    this.scrollToIssue();
    // }
  }

  getIssuesList(obj?) {
    if (obj?.issue_number) {
      this.issue_number = obj?.issue_number
    }

    this.searchText = ""
    this.unitsList.find((currentValue, index, arr) => {
      if (currentValue.id == this.selectedUnit_id) {
        this.selectedUnitName = currentValue.name
      }
    });
    this.selectedIssue = []
    this.offset = this.offset < 0 ? 0 : this.offset
    if (this.selectedPage == 'allIsuues') {
      this.dataService.passSpinnerFlag(true, true);

      this.issuesService.getIssuesList(this.selectedUnit_id, this.department_id, this.issueTypeIds, this.fromDateFliter, this.toDateFliter, this.equipmentCategoryFilter, this.equipmentFilter, this.escalated_BooleanValue, this.critical_BooleanValue, this.noOfRows, this.offset, this.parameter).subscribe({
        next: (data: any) => {
          //
          if (data?.issues?.length > 0) {
            // console.log("Issues list object : " + JSON.stringify(data)
            this.issuesList = data?.issues;
            // this.parameter = []
            // const fuse = new Fuse(this.issuesList, options)
            // this.issuesList = fuse.search('Maintenace Start')
            if (this.issue_number == null) {
              // console.log("issue123 : " + this.selectedIssue)
              this.selected = [this.issuesList[0]]
              this.rowId = this.selected[0]['id']
              this.selectedIssue = this.selected[0];
              console.log("issue123 : " + this.selected[0])
              this.scrollToIssue();

            }
            else {
              this.issuesList.find((currentValue, index, arr) => {
                if (currentValue.issue_number == this.issue_number) {
                  this.selectedIssue = currentValue
                  this.selected = [currentValue]
                  this.rowId = this.selected[0]['id']
                  let params = JSON.parse(sessionStorage.getItem('navigatingToIssue'));
                  this.params[0].escalated = true
                  this.params[0].critical = true

                  this.issuesService.getIssuesList(this.selectedUnit_id, this.department_id, '', '', '', '', '', true, true, this.noOfRows, this.offset, '')
                  if (params != null) {
                    this.scrollToIssue();
                    sessionStorage.removeItem('navigatingToIssue')
                    sessionStorage.removeItem('selectedIssue')
                  }
                }
              });
            }
            // this.filterReset()
            this.isRouteClicked = false
          }
          else {
            this.isRouteClicked = false
            this.issuesList = []
            this.selectedIssue = []
            this.dataService.passSpinnerFlag(false, true);
          }
          if (obj?.type == 'RISKRATING') {
            this.msg = 'RISKRATING submitted successfully';
            this.snackbarService.show(this.msg, false, false, false, false);
          }
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          this.dataService.passSpinnerFlag(false, true);
        }
      })
    }
    else if (this.selectedPage == 'myIsuues') {
      this.getMyIssues(obj)
      this.isRouteClicked = false
    }
  }
  getCreateIssue(data: any) {
    console.log(data)
    this.selectedPage = data.page;
    // this.department_id = null

    this.getTotalcount()
    // this.getIssuesList()
  }
  getLatestData(obj) {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssuesList(this.selectedUnit_id, this.department_id, '', '', '', '', '', this.escalated_BooleanValue, this.critical_BooleanValue, this.noOfRows, this.offset, '').subscribe({
      next: (data: any) => {
        if (data?.issues?.length > 0) {
          this.issuesList = data?.issues;
          this.issuesList.find((currentValue, index, arr) => {
            if (currentValue.issue_number == obj.issue_number) {
              this.selectedIssue = currentValue
              let params = JSON.parse(sessionStorage.getItem('navigatingToIssue'));
              if (params != null) {
                this.scrollToIssue();
              }
            }
          });
          this.selected = [this.selectedIssue]
          this.rowId = this.selected[0]['id']
        }
        else {
          this.issuesList = []
          this.selectedIssue = []
          // this.dataService.passSpinnerFlag(false, true);
        }
        if (obj.type == 'RISKRATING') {
          this.msg = 'RISKRATING submitted successfully';
          this.snackbarService.show(this.msg, false, false, false, false);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getSelectedDepartment(department: any) {
    this.department_id = department
    this.getTotalcount()
    // this.dataService.passSpinnerFlag(false, true);
  }
  getIssueStatus() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssueStatus().subscribe({
      next: (data: any) => {
        this.issue_types_list = data
        console.log(this.issue_types_list)
        this.issue_type_id = this.issue_types_list[0]?.id
        this.dataService.passSpinnerFlag(false, true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  issueEscalated() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.issueEscalated(this.selectedIssue.issue_number, { is_escalated: true }).subscribe({
      next: (data: any) => {
        this.dataService.passSpinnerFlag(true, true);
        this.issue_number = this.selectedIssue.issue_number

        this.getIssuesList();
        $('#escalateModal').modal('hide');
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getMyIssues(obj) {
    this.dataService.passSpinnerFlag(true, true);

    this.issuesService?.getMyIssues(this.selectedUnit_id, this.department_id, this.issueTypeIds, this.fromDateFliter, this.toDateFliter, true, this.equipmentCategoryFilter, this.equipmentFilter, this.escalated_BooleanValue, this.critical_BooleanValue, this.noOfRows, this.offset, this.parameter)?.subscribe({
      next: (data: any) => {
        if (data?.issues?.length > 0) {
          this.issuesList = data?.issues;
          if (this.issue_number == null) {
            this.selected = [this.issuesList[0]]
            this.rowId = this.selected[0]['id']
            this.selectedIssue = this.selected[0];
            this.scrollToIssue();
          }
          else {
            this.issuesList.find((currentValue, index, arr) => {
              if (currentValue.issue_number == this.issue_number) {
                this.selectedIssue = currentValue
                this.selected = [currentValue]
                this.rowId = this.selected[0]['id']
                let params = JSON.parse(sessionStorage.getItem('navigatingToIssue'));
                if (params != null) {
                  this.scrollToIssue();
                }
              }
            });
          }
          // this.selected = [this.issuesList[0]]
          // this.rowId = this.selected[0]['id']
          // this.selectedIssue = this.selected[0]
          // this.scrollToIssue();
          // this.filterReset()
          this.isRouteClicked = false
        }
        else {
          this.issuesList = []
          this.selectedIssue = []
          // this.dataService.passSpinnerFlag(false, true);
        }
        if (obj?.type == 'RISKRATING') {
          this.msg = 'RISKRATING submitted successfully';
          this.snackbarService.show(this.msg, false, false, false, false);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getAllIssues() {

  }
  onItemSelect(data) {

    this.issueTypeIds = [];
    console.log(data, this.statusFilter)
    this.statusFilter.forEach((element) => {
      this.issueTypeIds.push(element?.id)
    });
  }
  // onEquipmentCategorySelect(data){
  //   this.equipmentCategory = [];
  //   console.log(data,this.equipmentCategoryFilter)
  //   this.equipmentCategoryFilter.forEach((ele)=>{
  //     this. equipment_Category.push(ele?.id)
  //   })
  // }
  // onEquipmentSelect(data:any){
  //   this.equipmentList = [];
  //   console.log(data, this.equipmentFilter)
  //   this.equipmentFilter.forEach((el) =>{
  //     this.equipments.push(el?.id)
  //   })
  // }
  onItemDeSelect(data) {
    this.issueTypeIds = []
    console.log(data, this.statusFilter)
    this.statusFilter.forEach((element) => {
      this.issueTypeIds.push(element?.id)
    });
  }
  removeFilterData(id) {
    this.issueTypeIds = [];
    this.statusFilter.forEach((element, index) => {
      if (element.id == id) {
        this.statusFilter.splice(index, 1)
      }
    });
    // console.log(data,this.statusFilter)
    this.statusFilter.forEach((element) => {
      this.issueTypeIds.push(element?.id)
    });
    this.getTotalcount()
  }

  userValidation(row) {
    let index = row.persons_tagged.findIndex(ele => { return ele.id == this.loginUserId })
    if ((index >= 0 || this.loginUserEmail == row?.created_by) && row.status != 'Closed') {
      return false
    } else {
      return true
    }
  }

  selectedRow(row) {
    this.selected = [row]
    this.selectedIssue = row
    console.log(row.risk_rating)
  }
  scrollToIssue() {
    console.log('scrollToIssue')
    setTimeout(() => {
      $('#table').animate({
        scrollTop: $('#issue' + this.selectedIssue.id).position().top - 200
      });
      sessionStorage.removeItem('navigatingToIssue')
    }, 500);
  }

  getTotalcount() {
    this.screenHeight = 0;
    this.offset = -1;
    sessionStorage.setItem('storedUnitId', this.selectedUnit_id);
    window.dispatchEvent(new CustomEvent('unitchanged'))
    if (this.selectedPage == 'allIsuues') {
      this.dataService.passSpinnerFlag(true, true);

      this.issuesService.getIssuesList(this.selectedUnit_id, this.department_id, this.issueTypeIds, this.fromDateFliter, this.toDateFliter, this.equipmentCategoryFilter, this.equipmentFilter, this.escalated_BooleanValue, this.critical_BooleanValue, 1, 0, this.parameter).subscribe({
        next: (data: any) => {
          this.issuesLength = data?.total_count;
          this.getScreenSize();
          // this.dataService.passSpinnerFlag(false, true);
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.dataService.passSpinnerFlag(false, true);
        }
      })
    }
    else if (this.selectedPage == 'myIsuues') {
      this.dataService.passSpinnerFlag(true, true);
      this.issuesService?.getMyIssues(this.selectedUnit_id, this.department_id, this.issueTypeIds, this.fromDateFliter, this.toDateFliter, true, this.equipmentCategoryFilter, this.equipmentFilter, this.escalated_BooleanValue, this.critical_BooleanValue, 1, 0, this.parameter)?.subscribe({
        next: (data: any) => {
          this.issuesLength = data?.total_count;
          this.getScreenSize();
          // this.parameter=[]
          // this.dataService.passSpinnerFlag(false, true);
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.dataService.passSpinnerFlag(false, true);
        }
      })
    }
  }
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 225) / 70;
      this.noOfRows = Math.round(ss);
      this.displayActivePage(this.activePage, true);
    }
  }
  displayActivePage(activePageNumber: number, value?: boolean) {
    this.activePage = activePageNumber
    let offset;
    if (this.activePage > 0) {
      offset = Number(this.noOfRows * (this.activePage - 1));
      // end = Number(this.noOfRows * this.activePage) - 1;
      if (this.offset != offset || this.noTempOfRows != this.noOfRows) {
        this.offset = offset
        this.noTempOfRows = this.noOfRows;

        if (this.offset >= 0 && this.noOfRows > 0) {
          this.getIssuesList();
        }
      }
      // if(this.selectedPage == "myIsuues") {
      //   this.getMyIssues()
      // } else {

      // }
    }
  }
  closeFilterPopup() {
    this.isRouteClicked = false
  }
  startInputDisabled() {
    let dtToday = new Date();
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;

    $('#startDate').attr('max', minDate);
    // $('#endDate').attr('max', maxDate);
  }
  endInputDisabled() {
    let dtToday = new Date();
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;

    $('#endDate').attr('max', minDate);
    // $('#endDate').attr('max', maxDate);
  }
  ngOnDestroy() {
    sessionStorage.removeItem('navigatingToIssue')
    sessionStorage.removeItem('storeSeletedPage');
    sessionStorage.removeItem('navigateToAllIssues')
  }

}
