import { ISafetyAndSurveillancePages } from '../../app/interfaces/pages.interface';

export interface IModule {
    safetyAndSurveillance: ISafetyAndSurveillancePages;
    confinedSpaceMonitoring: Object;
    activityMonitoring: Object;
    manpowerCounting: Object;
    socialDistancing: Object;
    frontInspection: Object;
    interlockMonitoring: Object;
}