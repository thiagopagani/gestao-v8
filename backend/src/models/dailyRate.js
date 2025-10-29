module.exports = (sequelize, DataTypes) => {
    const DailyRate = sequelize.define('DailyRate', {
        data: { type: DataTypes.DATEONLY, allowNull: false },
        valor_diaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        valor_deslocamento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        valor_alimentacao: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        observacao: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('pendente', 'aprovado'), defaultValue: 'pendente' },
        paymentBatchId: { type: DataTypes.UUID, allowNull: true }
    });

    DailyRate.associate = (models) => {
        DailyRate.belongsTo(models.Employee, { foreignKey: 'funcionarioId', as: 'employee' });
        DailyRate.belongsTo(models.Client, { foreignKey: 'clienteId', as: 'client' });
    };

    return DailyRate;
};
