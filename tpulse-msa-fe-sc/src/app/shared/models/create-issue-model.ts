export class CreateIssueModel {
  unit_id: any;
  date: string;
  issue_number: string;
  deadline_to_close: string;
  task_id: string;
  created_by: string;
  issue_status: string;
  tag_person_ids: any[] = [];
  comments: string;
  risk_rating: string;
  issue_type_id: string;
  summary: any;
  file_list : any[]=[];
  constructor(data) {
    if (!data) {
      return;
    }
    this.unit_id = data.unit_id;
    this.date = data.date;
    this.issue_number = data.issue_number;
    this.deadline_to_close = data.deadline_to_close;
    this.task_id = data.task_id;
    this.created_by = data.created_by;
    this.issue_status = data.issue_status;
    this.tag_person_ids = data.tag_person_ids;
    this.comments = data.comments;
    this.risk_rating = data.risk_rating;
    this.issue_type_id = data.issue_type_id;
    this.summary = data.summary
    this.file_list = data.file_list;
  }
}

export class UpdateIssueStatusModel {
  issue_id: string;
  status: string;
  risk_rating: number;
  constructor(data) {
    if (!data) {
      return;
    }
    this.issue_id = data.issue_id;
    this.status = data.status;
    this.risk_rating = data.risk_rating;
  }
}


export class AddReplyToCommentModel {
  comment_id: string;
  reply: string;
  constructor(data) {
    if (!data) {
      return;
    }
    this.comment_id = data.comment_id;
    this.reply = data.reply;
  }
}


export class CommentOnIssueModel {
  issue_id: string;
  comment: string;
  constructor(data) {
    if (!data) {
      return;
    }
    this.issue_id = data.issue_id;
    this.comment = data.comment;
  }
}

export class CommentOnTaskModel {
  unit_id: any;
  file_list: any;
  task_id: string;
  comment: string;
  constructor(data) {
    if (!data) {
      return;
    }
    this.unit_id = data.unit_id;
    this.file_list = data.file_list;
    this.task_id = data.task_id;
    this.comment = data.comment;
  }
}

export class TagPersonsIssueModel {
  unit_id: string;
  issue_id: string;
  user_ids: any;
  constructor(data) {
    if (!data) {
      return;
    }
    this.unit_id = data.unit_id;
    this.issue_id = data.issue_id;
    this.user_ids = data.user_ids;
  }
}

export class DeleteTagPersonsIssueModel {
  issue_id: string;
  user_id: string;
  constructor(data) {
    if (!data) {
      return;
    }
    this.issue_id = data.issue_id;
    this.user_id = data.user_id;
  }

}
 export class AddLearningsModel {
   task_id:string;
   learning:string;
   constructor(data){
    if(!data){
      return
    }
   this.task_id = data.task_id;
   this.learning = data.learning;
   }
 }

