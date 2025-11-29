// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportNotice = require('../../../app/model/notice');
import ExportSysApiLog = require('../../../app/model/sysApiLog');
import ExportSysAppConfig = require('../../../app/model/sysAppConfig');
import ExportSysCaptcha = require('../../../app/model/sysCaptcha');
import ExportSysDictionaries = require('../../../app/model/sysDictionaries');
import ExportSysFile = require('../../../app/model/sysFile');
import ExportSysMenu = require('../../../app/model/sysMenu');
import ExportSystem = require('../../../app/model/system');
import ExportToken = require('../../../app/model/token');
import ExportUser = require('../../../app/model/user');
import ExportUserAuths = require('../../../app/model/userAuths');
import ExportUserInfo = require('../../../app/model/userInfo');
import ExportUserOrgan = require('../../../app/model/userOrgan');
import ExportUserRole = require('../../../app/model/userRole');

declare module 'egg' {
  interface IModel {
    Notice: ReturnType<typeof ExportNotice>;
    SysApiLog: ReturnType<typeof ExportSysApiLog>;
    SysAppConfig: ReturnType<typeof ExportSysAppConfig>;
    SysCaptcha: ReturnType<typeof ExportSysCaptcha>;
    SysDictionaries: ReturnType<typeof ExportSysDictionaries>;
    SysFile: ReturnType<typeof ExportSysFile>;
    SysMenu: ReturnType<typeof ExportSysMenu>;
    System: ReturnType<typeof ExportSystem>;
    Token: ReturnType<typeof ExportToken>;
    User: ReturnType<typeof ExportUser>;
    UserAuths: ReturnType<typeof ExportUserAuths>;
    UserInfo: ReturnType<typeof ExportUserInfo>;
    UserOrgan: ReturnType<typeof ExportUserOrgan>;
    UserRole: ReturnType<typeof ExportUserRole>;
  }
}
