

module.exports = app => {
    class CustomController extends app.Controller {
        constructor(props) {
            super(props);
        }
        error(message = '操作失败', status = 200, data) {
            if (typeof message === 'string') {
            this.ctx.body = {
                    msg: message,
                    status_code: status,
                    data,
                    status: 'F',
                };
            } else {
                this.ctx.body = Object.assign({}, {
                    status_code: status,
                    data,
                    status: 'F',
                }, message);
            }
            this.ctx.status = status;
        }
        success(data,msg='操作成功') {
          if(typeof data === 'string'){
              this.ctx.body = {
                  msg: data,
                  status: 'S',
                  status_code: 200
              }
          } else {
              this.ctx.body = {
                  msg: msg,
                  status: 'S',
                  data,
                  status_code: 200,
              };
          }
          this.ctx.status = 200;
        }

    }
    app.Controller = CustomController;

};
