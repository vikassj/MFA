export class ObservationStatusModel{
  status:string;
  remarks:string;
  constructor(data){
      if(!data){
          return;
      }

      this.status = data.status;
      this.remarks = data.remarks;
  }
}
