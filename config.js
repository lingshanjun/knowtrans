var config = {

    name: 'KnowTrans',
    slogan: 'To Know And To Transmit',

    // mongodb setting
    database:{
        cookieSecret: 'to-know-and-to-trans',
        db: 'kt',
        host: 'localhost',
        port: 27017
    },

    session_secret: 'know_trans_secret', // 务必修改
    auth_cookie_name: 'know_trans',
}

module.exports = config;