require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Connect to Database
connectDB();

const app = express();
module.exports = app;


// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./routes/authRoutes');
const childRoutes = require('./routes/childRoutes');
const phase1Routes = require('./routes/phase1Routes');
const phase2Routes = require('./routes/phase2Routes');
const phase3Routes = require('./routes/phase3Routes');
const specialistRoutes = require('./routes/specialistRoutes');
const progressRoutes = require('./routes/progressRoutes');

app.get('/', (req, res) => {
    res.send('RAFIQ API is running...');
});

app.use('/auth', authRoutes);
app.use('/children', childRoutes);
app.use('/phase1', phase1Routes);
app.use('/phase2', phase2Routes);
app.use('/phase3', phase3Routes);
app.use('/specialists', specialistRoutes);
app.use('/progress', progressRoutes);

// Auth and other routes will be added here

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

