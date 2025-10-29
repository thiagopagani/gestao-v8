module.exports = (sequelize, DataTypes) => {
    const PaymentBatch = sequelize.define('PaymentBatch', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        startDate: { type: DataTypes.DATEONLY, allowNull: false },
        endDate: { type: DataTypes.DATEONLY, allowNull: false },
        employeeIds: { type: DataTypes.JSON, allowNull: false },
        dailyRateIds: { type: DataTypes.JSON, allowNull: false },
        totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('aberto', 'pago'), defaultValue: 'aberto' },
    });

    return PaymentBatch;
};
