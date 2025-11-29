'use strict';

const Service = require('egg').Service;
const nodemailer = require('nodemailer');
class IndexService extends Service {

  constructor(ctx) {
    super(ctx);

    this.transporter = nodemailer.createTransport({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.secure, // true for 465, false for other ports
      auth: {
        user: this.config.email.user,
        pass: this.config.email.pass,
      },
    });
  }
  async send(toAddressArr = [ '576415369@qq.com' ], parms) {

    const info = await this.transporter.sendMail({
      from: `"系统邮件 👻" <${this.config.email.user}>`, // sender address
      to: toAddressArr.toString(), // list of receivers
      subject: parms.subject, // Subject line
      text: parms.text, // plain text body
      html: parms.html, // html body
    });

    return info.messageId;

  }


  async sendRandomCode(toAddressArr = [ '576415369@qq.com' ]) {
    const code = this.ctx.helper.getRandomNumber(6);


    const html = `<div id="qm_con_body">
    <div id="mailContentContainer"  class="qmbox qm_con_body_content qqmail_webmail_only" style="opacity: 1;">

</script><style>/* 邮件内部图片支持调起预览。 */img[image-inside-content='1'] {cursor: pointer;}</style>

<style>
    .qmbox a {
      color: #F5BC21;
      line-height: 1.3;
      text-decoration: none;
    }

    .qmbox a,.qmbox 
    a:hover,.qmbox 
    a:focus,.qmbox 
    a:active {
      text-decoration: none;
    }

    .qmbox a:hover,.qmbox 
    a:focus {
      color: #F5BC21;
    }
    .qmbox p {
      line-height: 1.5;
    }
    .qmbox .content {
      padding: 90px 5%;
      margin: auto;
      width: 100%;
      background-color: #f5f5f7;
      box-shadow: 0 2px 3px 0 rgba(0,0,0,.1);
      box-sizing: border-box;
    }
    .qmbox .content > div {
      max-width: 600px;
      margin: 0 auto;
    }
    .qmbox .logo-container {
      width: 100%;
      height: 66px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-bottom:15px;
    }
    .qmbox .email-text-container {
      box-sizing: border-box;
      padding: 45px 50px;
      margin: auto;
      background-color: #fff;
      border: solid 1px #eeeeee;
      text-align: left;
    }
    .qmbox .email-text-container > div {
      color: #adadb2;
      font-size: 14px;
      line-height: 0.8;
      text-align: left;
    }
    .qmbox .title {
      margin: 0 auto 10px;
      font-size: 18px;
      font-weight: 500;
      line-height: 25px;
      color: #34313f;
    }
    .qmbox .text-table {
      margin: 0 auto;
      width: 100%;
      background-color: #fff;
      border-collapse: collapse;
      line-height: 1.8;
      font-size: 14px;
    }
    .qmbox .text-table td {
      padding: 10px 15px;
      border: 1px solid #e3e2e9;
      text-align: left;
    }
    .qmbox .tips {
      margin: 0;
      font-size: 14px;
      color: #aaadb3;
      line-height: 30px;
    }
    .qmbox .result-url {
      max-width: 410px;
      text-decoration: none;
      color: #aaadb3!important;
      word-wrap: break-word;
      word-break: break-all;
    }
    .qmbox .footer {
      margin: 30px auto 0;
      width: 250px;
      font-size: 14px;
      line-height: 25px;
      color: #aaadb3;
    }
    @media screen and (max-width: 768px) {
      .qmbox .email-text-container {
        padding: 45px 20px;
      }
      .qmbox tr > td:first-of-type {
        width: 30%!important;
      }
    }
  </style>
<div class="content">
    <div class="email-text-container">
        <div>
            <p class="title">您的验证码为{{code}}，若非本人请忽略。</p>
            <div style="color: #aaadb3">
                验证码将在30分钟后失效。
            </div>
        </div>
        <div>
            <p class="tips">请勿泄露验证码</p>
        </div>
    </div>
</div>


<style type="text/css">.qmbox style, .qmbox script, .qmbox head, .qmbox link, .qmbox meta {display: none !important;}</style></div></div>`;


    const messageId = await this.send(toAddressArr, {
      subject: '验证码',
      text: '',
      html: html.replace('{{code}}', code),
    });

    // 写入redis缓存
    for (const address of toAddressArr) {
      await this.app.redis.set(`validation-email-${address}`, code.toString(), 'EX', 60 * 30);
    }
  }

  async checkCode(emailAddress, code) {
    const cacheCode = await this.app.redis.get(`validation-email-${emailAddress}`);
    if (cacheCode !== code) {
      return false;
    }
    return true;
  }
}

module.exports = IndexService;
