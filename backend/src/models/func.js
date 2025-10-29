module.exports = (sequelize, DataTypes) => {
    const Func = sequelize.define('Func', {
        nome: { type: DataTypes.STRING, allowNull: false, unique: true },
        descricao: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('ativo', 'inativo'), defaultValue: 'ativo' }
    });

    Func.associate = (models) => {
        Func.hasMany(models.Employee, { foreignKey: 'funcaoId', as: 'employees' });
    };

    return Func;
};
