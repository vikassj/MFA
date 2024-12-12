export class DashboardModel{
    name:string;
    faIcon:string;
    totalCount:number;
    pendingCount:number;
    constructor(data: { name: string; totalCount: number; pendingCount: number;faIcon: string; }){
        if(!data){
            return;
        }

        this.name = data.name;
        this.faIcon = data.faIcon;
        this.totalCount = data.totalCount;
        this.pendingCount = data.pendingCount;
    }
}
