module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        nome: { type: DataTypes.STRING, allowNull: false },
        cpf_cnpj: { type: DataTypes.STRING, unique: true },
        telefone: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, validate: { isEmail: true } },
        endereco: { type: DataTypes.STRING },
        cep: { type: DataTypes.STRING },
        cidade: { type: DataTypes.STRING },
        estado: { type: DataTypes.STRING },
        status: { type: DataTypes.ENUM('ativo', 'inativo'), defaultValue: 'ativo' }
    });

    Client.associate = (models) => {
        Client.belongsTo(models.Company, { foreignKey: 'empresaId', as: 'company' });
        Client.hasMany(models.DailyRate, { foreignKey: 'clienteId', as: 'dailyRates' });
    };

    return Client;
};
