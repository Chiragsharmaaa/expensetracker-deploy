const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type:Sequelize.INTEGER,
        unique:true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    }, 
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    }, 
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ispremiumuser: Sequelize.BOOLEAN
});

module.exports = User;