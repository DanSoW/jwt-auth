// Загрузка конфигурационного файла для работы с переменными среды
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');

const {
    sequelize,
    Sequelize
} = require('./sequelize/database');

const PORT = process.env.PORT || 5000;
const app = express();

// Определение middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware);

const start = async() => {
    try{
        app.listen(PORT, () => {
            console.log(`Server started on PORT = ${PORT}`)
        })
    }catch(e){
        console.log(e);
    }
}

start()