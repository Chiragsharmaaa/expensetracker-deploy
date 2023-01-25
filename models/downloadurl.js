const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Downloadurl = sequelize.define('downloadurl', {
    id: {
        type: Sequelize.INTEGER,
        unique:true,
        autoIncrement:true,
        allowNull: false,
        primaryKey:true
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = Downloadurl;