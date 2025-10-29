module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        nome: { type: DataTypes.STRING, allowNull: false },
        cpf: { type: DataTypes.STRING, allowNull: false, unique: true },
        telefone: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, validate: { isEmail: true } },
        endereco: { type: DataTypes.STRING },
        cidade: { type: DataTypes.STRING },
        estado: { type: DataTypes.STRING },
        cep: { type: DataTypes.STRING },
        observacoes: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('ativo', 'inativo'), defaultValue: 'ativo' }
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.Func, { foreignKey: 'funcaoId', as: 'func' });
        Employee.hasMany(models.DailyRate, { foreignKey: 'funcionarioId', as: 'dailyRates' });
    };

    return Employee;
};
