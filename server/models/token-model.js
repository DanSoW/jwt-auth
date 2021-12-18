module.exports = function (sequelize, DataTypes) {
    return sequelize.define('tokens', {
        refresh_token:  {
            type: DataTypes.STRING,
            required: true
        }
    });
};