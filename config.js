var config = {

    name: 'KnowTrans',
    slogan: 'To Know And To Transmit',
    host:'knowtrans.com',

    // mongodb setting
    database:{
        cookieSecret: 'to-know-and-to-trans',
        db: 'kt',
        host: 'localhost',
        port: 27017
    },

    session_secret: 'know_trans_secret', // 务必修改
    auth_cookie_name: 'know_trans',

    // 邮箱配置
    mail_opts: {
        host: 'smtp.126.com',
        port: 25,
        auth: {
          user: 'knowtrans@126.com',
          pass: '123456lwj'
        }
    }
}

module.exports = config;