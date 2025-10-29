module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
        nome: { type: DataTypes.STRING, allowNull: false },
        cpf_cnpj: { type: DataTypes.STRING, allowNull: false, unique: true },
        telefone: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
        endereco: { type: DataTypes.STRING },
        cep: { type: DataTypes.STRING },
        cidade: { type: DataTypes.STRING },
        estado: { type: DataTypes.STRING },
        status: { type: DataTypes.ENUM('ativo', 'inativo'), defaultValue: 'ativo' }
    });

    Company.associate = (models) => {
        Company.hasMany(models.Client, { foreignKey: 'empresaId', as: 'clients' });
    };

    return Company;
};
