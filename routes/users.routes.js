const router = require("express").Router()
const bcrypt = require('bcrypt') 
const User = require("../models/User")




module.exports = router

//обновление данных юзера
router.put("/:id", async (req, res) => {
if(req.body.userId === req.params.id || req.body.isAdmin) {
    if(req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        } catch(err) {
            return res.status(500).json(err);
        }
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        })
        res.status(200).json("Аккаует обновлен")
    } catch (err) {
        return res.status(500).json(err)
    }
    
}
else {
    return res.status(403).json("Вы можете изменить только свой аккаунт")
}
})

//удаление юзера
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch(err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Аккаует удален")
        } catch (err) {
            return res.status(500).json(err)
        }
        
    }
    else {
        return res.status(403).json("Вы можете удалить только свой аккаунт")
    }
    })

    //чтение юзера
    router.get("/:id", async(req, res) => {
        try {
            const user = await User.findById(req.params.id)
            //исключить передачу полей
            const { password, updatedAt, ...other } = user._doc;
            res.status(200).json(other)

        } catch(err) {
            res.status(500).json(err)
        }
    })

//подписаться на юзера
router.put("/:id/follow", async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id) //юзер который в адресной строке
            const currentUser = await User.findById(req.body.userId) //юзер который делает запрос (указан в теле запроса)

            //если пользователь не подписан на текущего то 
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne ({$push: {followers: req.body.userId}}) //первого юзера добавляем в подписчики
                await currentUser.updateOne ({$push: {followings: req.params.id}})  //юзер на которого подписались
                res.status(200).json("Успешно подписались")

            }
            else {
                res.status(403).json("Вы уже подписаны")
            }

            res.status(500).json(user)

        } catch(err) {
            res.status(500).json(err)
        }
    } 
    
    else {
        res.status(403).json("Не возможно подписаться на себя")
    } 
})

//отписаться от юзера
router.put("/:id/unfollow", async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id) //юзер который в адресной строке
            const currentUser = await User.findById(req.body.userId) //юзер который в теле запроса

            //если пользователь подписан на текущего то 
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne ({$pull: {followers: req.body.userId}}) //первого юзера добавляем в подписчики
                await currentUser.updateOne ({$pull: {followings: req.params.id}})  //юзер на которого подписались
                res.status(200).json("Успешно отписались")

            }
            else {
                res.status(403).json("Вы уже отписаны")
            }

            res.status(500).json(user)

        } catch(err) {
            res.status(500).json(err)
        }
    } 
    
    else {
        res.status(403).json("Не возможно отписаться от себя")
    } 
})