const Controller = require('../core/base_controller');

class CoreController extends Controller {

  constructor() {
    // 调用父类的构造函数，并传递 modelName 参数
    super('core');
  }
  async index() {
    const { ctx } = this;
    this.jsonSuccess('hi, egg');
    ctx.body = 'hi, egg';
  }
}

module.exports = CoreController;
