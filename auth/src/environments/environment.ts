// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //be-dev userpool.
  // cognito: {
  //   userPoolId: 'ap-northeast-1_JfsxfbyBB',
  //   userPoolWebClientId: '4lcm5vn5dnohscmjsda24ihkln'
  // },
   //msa-dev userpool.
  //  cognito: {
  //   userPoolId: 'ap-south-1_pjowYWyOf',
  //   userPoolWebClientId: '5beeti1aanj9mdvh5tgqdhggdb'
  // },

  // be-qa userpool
  // cognito: {
  //   userPoolId: 'ap-south-1_xIB3fWTp6',
  //   userPoolWebClientId: '74lvbldlsme6pcalolf6tq1548'
  // },

  // msa-qa userpool
  cognito: {
    userPoolId: 'ap-south-1_aPl5viEhG',
    userPoolWebClientId: '6012f6thsshdhshj9lvdhvdvhk'
  },

  // vedanta user pool
  // cognito: {
  //   userPoolId: 'ap-south-1_jIdyfZecH',
  //   userPoolWebClientId: '772ujmitl41i1l4nfg7llv1ms9'
  // },
  // msa-uat
  // cognito: {
  //   userPoolId: 'ap-south-1_lGQuo2Cvu',
  //   userPoolWebClientId: '58ul1jsleek0qf9etcjeua6btu'
  // },
  environmentName: 'dev'
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
