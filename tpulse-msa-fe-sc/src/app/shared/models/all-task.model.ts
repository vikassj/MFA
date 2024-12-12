export class SurpriseTaskModel{
  date:string;
  unit:string;
  equipment:string;
  equipment_category:string;
  department:string;
  function:string;
  task_name:string;
  created_by:string;
  expected_start_date:string;
  expected_start_time:string;
  planned_duration_days:string;
  planned_duration_hours:string;
  tag_persons:any;
  comments:string;
  constructor(data){
      if(!data){
          return;
      }

      this.date = data.date;
      this.unit = data.unit;
      this.equipment = data.equipment;
      this.equipment_category = data.equipment_category;
      this.department = data.department;
      this.function = data.function;
      this.task_name = data.task_name;
      this.created_by = data.created_by;
      this.expected_start_date = data.expected_start_date;
      this.expected_start_time = data.expected_start_time;
      this.planned_duration_days = data.planned_duration_days;
      this.planned_duration_hours = data.planned_duration_hours;
      this.tag_persons = data.tag_persons;
      this.comments = data.comments;
  }
}
