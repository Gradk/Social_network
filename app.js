const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const helmet = require('helmet') 
const morgan = require('morgan') //вывод в консоле статуса страниц


//подключаем наши роуты
const userRoute = require('./routes/users.routes')
const authRoute = require('./routes/auth.routes')
const postRoute = require('./routes/posts.routes')



const app = express()

//middleweare промежуточные скрипты
app.use(express.json())
app.use(helmet());
app.use(morgan("common")) 


/**
 * промежуточные функции, при обращении 
 * на адрес с api открываем роут...
 * 
**/
app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postRoute)



const PORT = config.get('port') || 5000


async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`Server started on port ${PORT}...`))
    } catch (e) {
        console.log('Server Error', e.message)
    }
}

start()

//роуты

app.get("/",(req,res) => {
    res.send('welcom to home page')
})

app.get("/users",(req,res) => {
    res.send('welcom to users page')
})
