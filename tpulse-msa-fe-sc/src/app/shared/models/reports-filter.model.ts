export class ReportsFilterModel{
  startDate:Date;
  toDate:Date;
  constructor(data){
      if(!data){
          return;
      }

      this.startDate = data.startDate;
      this.toDate = data.toDate;
  }
}
