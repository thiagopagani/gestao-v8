require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { sequelize, setupInitialData } = require('./src/models');
const logger = require('./src/config/logger');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://172.16.10.132', // Adjust if your frontend is on a different origin
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));


// API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', require('./src/routes/auth'));
apiRouter.use('/users', require('./src/routes/users'));
apiRouter.use('/companies', require('./src/routes/companies'));
apiRouter.use('/clients', require('./src/routes/clients'));
apiRouter.use('/employees', require('./src/routes/employees'));
apiRouter.use('/funcs', require('./src/routes/funcs'));
apiRouter.use('/daily-rates', require('./src/routes/dailyRates'));
apiRouter.use('/payment-batches', require('./src/routes/paymentBatches'));

// Main API prefix
app.use('/api', apiRouter);

// Ping route for health check
app.get('/api/ping', (req, res) => res.send('pong'));


const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(async () => {
    logger.info('Database connected and synced.');
    
    // Setup initial admin user if none exist
    await setupInitialData();
    
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    logger.error('Failed to sync database:', err);
});
