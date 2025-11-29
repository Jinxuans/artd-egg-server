// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuthBackup = require('../../../app/middleware/auth-backup');
import ExportAuthFixed = require('../../../app/middleware/auth-fixed');
import ExportAuth = require('../../../app/middleware/auth');
import ExportErrorHanlder = require('../../../app/middleware/errorHanlder');
import ExportTools = require('../../../app/middleware/tools');

declare module 'egg' {
  interface IMiddleware {
    authBackup: typeof ExportAuthBackup;
    authFixed: typeof ExportAuthFixed;
    auth: typeof ExportAuth;
    errorHanlder: typeof ExportErrorHanlder;
    tools: typeof ExportTools;
  }
}
