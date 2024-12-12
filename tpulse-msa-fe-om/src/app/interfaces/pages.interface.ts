import { IPlantHomeFeatures, IPlantHelpFeatures, IPlantChangePasswordFeatures, IUnitDashboardFeatures, IUnitObservationsFeatures, IUnitReportsFeatures, IUnitHelpFeatures, IUnitChangePasswordFeatures } from './features.interface';

export interface ISafetyAndSurveillancePages {
    plant: IPlantPages;
    unit: IUnitPages;
}

export interface IPlantPages {
    home: IPlantHomeFeatures;
    help: IPlantHelpFeatures;
    changePassword: IPlantChangePasswordFeatures;
}

export interface IUnitPages {
    dashboard: IUnitDashboardFeatures;
    observations: IUnitObservationsFeatures;
    reports: IUnitReportsFeatures;
    help: IUnitHelpFeatures;
    changePassword: IUnitChangePasswordFeatures;
}

