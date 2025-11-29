// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportCore = require('../../../app/controller/core');
import ExportHome = require('../../../app/controller/home');
import ExportApiV1Notice = require('../../../app/controller/api/v1/notice');
import ExportApiV1SysApiLog = require('../../../app/controller/api/v1/sysApiLog');
import ExportApiV1SysAppConfig = require('../../../app/controller/api/v1/sysAppConfig');
import ExportApiV1SysCaptcha = require('../../../app/controller/api/v1/sysCaptcha');
import ExportApiV1SysDictionaries = require('../../../app/controller/api/v1/sysDictionaries');
import ExportApiV1SysFile = require('../../../app/controller/api/v1/sysFile');
import ExportApiV1SysMenu = require('../../../app/controller/api/v1/sysMenu');
import ExportApiV1SysPayType = require('../../../app/controller/api/v1/sysPayType');
import ExportApiV1System = require('../../../app/controller/api/v1/system');
import ExportApiV1SysTenants = require('../../../app/controller/api/v1/sysTenants');
import ExportApiV1Token = require('../../../app/controller/api/v1/token');
import ExportApiV1User = require('../../../app/controller/api/v1/user');
import ExportApiV1UserAuths = require('../../../app/controller/api/v1/userAuths');
import ExportApiV1UserInfo = require('../../../app/controller/api/v1/userInfo');
import ExportApiV1UserRole = require('../../../app/controller/api/v1/userRole');
import ExportToolsWxPayWxCallBack = require('../../../app/controller/tools/wxPay/wxCallBack');

declare module 'egg' {
  interface IController {
    core: ExportCore;
    home: ExportHome;
    api: {
      v1: {
        notice: ExportApiV1Notice;
        sysApiLog: ExportApiV1SysApiLog;
        sysAppConfig: ExportApiV1SysAppConfig;
        sysCaptcha: ExportApiV1SysCaptcha;
        sysDictionaries: ExportApiV1SysDictionaries;
        sysFile: ExportApiV1SysFile;
        sysMenu: ExportApiV1SysMenu;
        sysPayType: ExportApiV1SysPayType;
        system: ExportApiV1System;
        sysTenants: ExportApiV1SysTenants;
        token: ExportApiV1Token;
        user: ExportApiV1User;
        userAuths: ExportApiV1UserAuths;
        userInfo: ExportApiV1UserInfo;
        userRole: ExportApiV1UserRole;
      }
    }
    tools: {
      wxPay: {
        wxCallBack: ExportToolsWxPayWxCallBack;
      }
    }
  }
}
