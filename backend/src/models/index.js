const { Sequelize } = require('sequelize');
const config = require('../config/database');
const User = require('./user');
const Company = require('./company');
const Client = require('./client');
const Employee = require('./employee');
const Func = require('./func');
const DailyRate = require('./dailyRate');
const PaymentBatch = require('./paymentBatch');

const sequelize = new Sequelize(config);

const models = {
    User: User(sequelize, Sequelize.DataTypes),
    Company: Company(sequelize, Sequelize.DataTypes),
    Client: Client(sequelize, Sequelize.DataTypes),
    Employee: Employee(sequelize, Sequelize.DataTypes),
    Func: Func(sequelize, Sequelize.DataTypes),
    DailyRate: DailyRate(sequelize, Sequelize.DataTypes),
    PaymentBatch: PaymentBatch(sequelize, Sequelize.DataTypes),
};

// Setup Associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Function to create initial admin user
models.setupInitialData = async () => {
    const userCount = await models.User.count();
    if (userCount === 0) {
        console.log('No users found, creating initial admin and operator...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const operatorPassword = await bcrypt.hash('operador123', salt);

        await models.User.bulkCreate([
            { nome: 'Admin', email: 'admin@gestao.com', password: adminPassword, role: 'admin', status: 'ativo' },
            { nome: 'Operador', email: 'operador@gestao.com', password: operatorPassword, role: 'operador', status: 'ativo' }
        ]);
        console.log('Initial users created.');
    }
};

module.exports = models;
