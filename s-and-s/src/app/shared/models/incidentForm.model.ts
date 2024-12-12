export class IncidentFormModel{
    id: any;
    plant: string;
    unit: any;
    unit_name: string;
    zone: any;
    iogpcategories : any;
    zone_name: string;
    summary: string;
    incident_type: string;
    incident_factor: {};
    sector: {}
    sector_description: string;
    incident_factor_description:string;
    damage: {};
    damage_description:string;
    duration_of_fire: number;
    fatality: {};
    serious_injury: {};
    observation_id: number;
    investigation_due_date: Date;
    investigation_time: string;
    incident_date: string;
    incident_time: string;
    report_due_date: string;
    reporter: number;
    investigators: any[];
    stakeholders: any [];
    status: string;
    is_shutdown: boolean;
    lost_time_injury: boolean;
    description: string;
    immediate_response: string;
  constructor(data){
      if(!data){
          return;
      }

      this.id = data.id? data.id : null;
      this.plant = data.plant? data.plant : '';
      this.unit = data.unit? data.unit : '';
      this.unit_name = data.unit_name? data.unit_name : '';
      this.zone = data.zone ? data.zone : '';
      this.zone_name = data.zone_name ? data.zone_name : '';
      this.summary = data.summary? data.summary : '';
      this.iogpcategories = data.categories ? data.categories : [];
      this.incident_type = data.incident_type ? data.incident_type : 'actual';
      this.incident_factor = data.incident_factor ? data.incident_factor : {};
      this.sector = data.sector ? data.sector : {};
      this.sector_description = data.sector_description ? data.sector_description : '';
      this.incident_factor_description = data.incident_factor_description ? data.incident_factor_description : '';
      this.damage_description = data.damage_description ? data.damage_description : '';
      this.damage = data.damage ? data.damage : {};
      this.duration_of_fire = data.duration_of_fire ? data.duration_of_fire : 0;
      this.fatality = data.fatality ? data.fatality : {};
      this.serious_injury = data.serious_injury ? data.serious_injury : {};
      this.observation_id = data.observation_id ? data.observation_id : null;
      this.investigation_due_date = data.investigation_due_date ? data.investigation_due_date : null;
      this.investigation_time = data.investigation_time ? data.investigation_time : null;
      this.report_due_date = data.report_due_date ? data.report_due_date : null;
      this.incident_time = data.incident_time ? data.incident_time : '';
      this.incident_date = data.incident_date ? data.incident_date : '';
      this.reporter = data.reporter ? data.reporter : null;
      this.investigators = data.investigators ? data.investigators : [];
      this.stakeholders = data.stakeholders ? data.stakeholders : [];
      this.status = data.status ? data.status : 'incident_logged';
      this.is_shutdown = data.is_shutdown ? data.is_shutdown : true;
      this.description = data.description ? data.description : '';
      this.immediate_response = data.immediate_response ? data.immediate_response : '';
  }
}
