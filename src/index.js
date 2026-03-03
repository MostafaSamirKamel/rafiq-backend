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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/children', childRoutes);
app.use('/api/v1/phase1', phase1Routes);
app.use('/api/v1/phase2', phase2Routes);
app.use('/api/v1/phase3', phase3Routes);
app.use('/api/v1/specialists', specialistRoutes);
app.use('/api/v1/progress', progressRoutes);

// Auth and other routes will be added here

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
