export class CreateObservations {
    unit: any
    unit_name: string
    equipment_id: any
    component_id: any
    observation_desc: string
    date: string
    images: any[] = [];
    constructor(data) {
        if (!data) {
            return;
        }

        this.unit = data.unit;
        this.unit_name = data.unit_name;
        this.equipment_id = data.equipment_id;
        this.component_id = data.component_id;
        this.observation_desc = data.observation_desc;
        this.date = data.date;
        this.images = data.images;
    }
}

export class CreateRecomondations {
    unit: any
    unit_name: string
    equipment_id: string
    component_id: any
    recommendation_desc: string
    date: string
    fault: string
    observation_id: any;
    images: any[]
    tagged_users: any[] = [];
    constructor(data) {
        if (!data) {
            return;
        }

        this.unit = data.unit;
        this.unit_name = data.unit_name;
        this.equipment_id = data.equipment_id;
        this.component_id = data.component_id;
        this.recommendation_desc = data.recommendation_desc;
        this.date = data.date;
        this.fault = data.fault;
        this.observation_id = data.observation_id;
        this.images = data.images;
        this.tagged_users = data.tagged_users;
    }
}

export class TagUsersInRecomondations {
    recommendation_id: any
    tagged_users: any[]
    unit_id: any
    equipment_id: any
    constructor(data) {
        if (!data) {
            return;
        }
        this.recommendation_id = data.recommendation_id;
        this.tagged_users = data.tagged_users;
        this.unit_id = data.unit_id;
        this.equipment_id = data.equipment_id;
    }
}

export class AddCommentsToRecomondations {
    unit_id: any
    unit_name: string
    equipment_id: any
    recommendation_id: any
    update_comment: string
    comment_file: []
    constructor(data) {
        if (!data) {
            return;
        }
        this.unit_id = data.unit_id;
        this.unit_name = data.unit_name;
        this.equipment_id = data.equipment_id;
        this.recommendation_id = data.recommendation_id;
        this.update_comment = data.update_comment;
        this.comment_file = data.comment_file;
    }
}

export class UpdateRecomondationStatus {
    status: string
    recommendation_id: any
    constructor(data) {
        if (!data) {
            return;
        }
        this.status = data.status;
        this.recommendation_id = data.recommendation_id;
    }
}

export class UpdateObservationRemarks {
    observation_id: any;
    remarks: string;
    constructor(data) {
        if (!data) {
            return;
        }
        this.observation_id = data.observation_id;
        this.remarks = data.remarks;
    }
}
