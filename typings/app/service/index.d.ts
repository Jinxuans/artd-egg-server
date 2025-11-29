// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportHome = require('../../../app/service/home');
import ExportToolsRedis = require('../../../app/service/tools/redis');
import ExportToolsSafe = require('../../../app/service/tools/safe');
import ExportApiV1Notice = require('../../../app/service/api/v1/notice');
import ExportApiV1SysApiLog = require('../../../app/service/api/v1/sysApiLog');
import ExportApiV1SysAppConfig = require('../../../app/service/api/v1/sysAppConfig');
import ExportApiV1SysCaptcha = require('../../../app/service/api/v1/sysCaptcha');
import ExportApiV1SysDictionaries = require('../../../app/service/api/v1/sysDictionaries');
import ExportApiV1SysFile = require('../../../app/service/api/v1/sysFile');
import ExportApiV1SysMenu = require('../../../app/service/api/v1/sysMenu');
import ExportApiV1System = require('../../../app/service/api/v1/system');
import ExportApiV1SysTenants = require('../../../app/service/api/v1/sysTenants');
import ExportApiV1Token = require('../../../app/service/api/v1/token');
import ExportApiV1User = require('../../../app/service/api/v1/user');
import ExportApiV1UserAuths = require('../../../app/service/api/v1/userAuths');
import ExportApiV1UserInfo = require('../../../app/service/api/v1/userInfo');
import ExportApiV1UserOrgan = require('../../../app/service/api/v1/userOrgan');
import ExportApiV1UserRole = require('../../../app/service/api/v1/userRole');
import ExportToolsAliOss = require('../../../app/service/tools/ali/oss');
import ExportToolsAliSingleCall = require('../../../app/service/tools/ali/singleCall');
import ExportToolsAliSms = require('../../../app/service/tools/ali/sms');
import ExportToolsAlipayIndex = require('../../../app/service/tools/alipay/index');
import ExportToolsEmailIndex = require('../../../app/service/tools/email/index');
import ExportToolsExcelIndex = require('../../../app/service/tools/excel/index');
import ExportToolsGAuthenticatorIndex = require('../../../app/service/tools/gAuthenticator/index');
import ExportToolsGetuiPush = require('../../../app/service/tools/getui/push');
import ExportToolsQiniuIndex = require('../../../app/service/tools/qiniu/index');
import ExportToolsTencentCos = require('../../../app/service/tools/tencent/cos');
import ExportToolsWeixinApp = require('../../../app/service/tools/weixin/app');
import ExportToolsWeixinIndex = require('../../../app/service/tools/weixin/index');
import ExportToolsWeixinWxapp = require('../../../app/service/tools/weixin/wxapp');
import ExportToolsWxpayIndex = require('../../../app/service/tools/wxpay/index');

declare module 'egg' {
  interface IService {
    home: AutoInstanceType<typeof ExportHome>;
    tools: {
      redis: AutoInstanceType<typeof ExportToolsRedis>;
      safe: AutoInstanceType<typeof ExportToolsSafe>;
      ali: {
        oss: AutoInstanceType<typeof ExportToolsAliOss>;
        singleCall: AutoInstanceType<typeof ExportToolsAliSingleCall>;
        sms: AutoInstanceType<typeof ExportToolsAliSms>;
      }
      alipay: {
        index: AutoInstanceType<typeof ExportToolsAlipayIndex>;
      }
      email: {
        index: AutoInstanceType<typeof ExportToolsEmailIndex>;
      }
      excel: {
        index: AutoInstanceType<typeof ExportToolsExcelIndex>;
      }
      gAuthenticator: {
        index: AutoInstanceType<typeof ExportToolsGAuthenticatorIndex>;
      }
      getui: {
        push: AutoInstanceType<typeof ExportToolsGetuiPush>;
      }
      qiniu: {
        index: AutoInstanceType<typeof ExportToolsQiniuIndex>;
      }
      tencent: {
        cos: AutoInstanceType<typeof ExportToolsTencentCos>;
      }
      weixin: {
        app: AutoInstanceType<typeof ExportToolsWeixinApp>;
        index: AutoInstanceType<typeof ExportToolsWeixinIndex>;
        wxapp: AutoInstanceType<typeof ExportToolsWeixinWxapp>;
      }
      wxpay: {
        index: AutoInstanceType<typeof ExportToolsWxpayIndex>;
      }
    }
    api: {
      v1: {
        notice: AutoInstanceType<typeof ExportApiV1Notice>;
        sysApiLog: AutoInstanceType<typeof ExportApiV1SysApiLog>;
        sysAppConfig: AutoInstanceType<typeof ExportApiV1SysAppConfig>;
        sysCaptcha: AutoInstanceType<typeof ExportApiV1SysCaptcha>;
        sysDictionaries: AutoInstanceType<typeof ExportApiV1SysDictionaries>;
        sysFile: AutoInstanceType<typeof ExportApiV1SysFile>;
        sysMenu: AutoInstanceType<typeof ExportApiV1SysMenu>;
        system: AutoInstanceType<typeof ExportApiV1System>;
        sysTenants: AutoInstanceType<typeof ExportApiV1SysTenants>;
        token: AutoInstanceType<typeof ExportApiV1Token>;
        user: AutoInstanceType<typeof ExportApiV1User>;
        userAuths: AutoInstanceType<typeof ExportApiV1UserAuths>;
        userInfo: AutoInstanceType<typeof ExportApiV1UserInfo>;
        userOrgan: AutoInstanceType<typeof ExportApiV1UserOrgan>;
        userRole: AutoInstanceType<typeof ExportApiV1UserRole>;
      }
    }
  }
}
