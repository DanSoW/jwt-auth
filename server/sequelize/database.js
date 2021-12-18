const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.USER,
    process.env.PASSWORD,
    {
        dialect: "postgres",
        host: process.env.HOST,
        port: process.env.DATABASE_PORT,
        define: {
            timestamps: false
        }
    }
);

const Users = require('../models/user-model')(sequelize, Sequelize);
const Tokens = require('../models/token-model')(sequelize, Sequelize);

Users.hasMany(Tokens, { foreignKey: 'user_id' });
Tokens.belongsTo(Users, { foreignKey: 'user_id' });

sequelize.sync().then(result => {
    console.log(result);
}).catch(err => console.log(err));

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.Users = Users;
module.exports.Tokens = Tokens;