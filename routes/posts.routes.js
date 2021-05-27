const router = require("express").Router()
const Post = require("../models/Post")
const User = require("../models/User")



//создание поста
router.post("/new", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch(err) {
        res.status(500).json(err)
    }
})

//изменение поста
router.put("/:id/edit", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await Post.updateOne({$set:req.body})
            res.status(200).json("Пост успешно обновлен")

        } else {
            res.status(403).json("Изменять может только владелец")
        }
    } catch(err) {
        res.status(500).json(err)
    }
})


//удаление поста
router.delete("/:id/del", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await Post.deleteOne()
            res.status(200).json("Пост успешно удален")

        } else {
            res.status(403).json("Удалять может только владелец")
        }
    } catch(err) {
        res.status(500).json(err)
    }
})


//лайкнуть пост или снять лайк
router.post("/:id/like", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId) ) {
            await post.updateOne({$push: {likes: req.body.userId}})
            res.status(200).json("лайк поставлен")
        } else {
            await post.updateOne({$pull: {likes: req.body.userId}})
            res.status(200).json("лайк снят")
        }
            
    } catch (err) {
        res.status(500).json(err)
    }
})



//читать пост, вывод поста
router.get("/:id",  async(req, res) => { 
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})


//график постов
router.get("/timeline/all", async (req, res) => {
    try {
      const currentUser = await User.findById(req.body.userId); //из тела запроса берем айди юзера и ищем в модели юзера
      const userPosts = await Post.find({ userId: currentUser._id }); // из модели поста ищем айди автора поста (в каждом посте указываем userId), 
                                                                    //которые совпадаю с юзером в теле запроса
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => { //массив подписчиков записываем в новый массив friendmap
          return Post.find({ userId: friendId }); //перебираем каждое значение и при совпадении запишем в массив friendPost
        })
      );
      res.json(userPosts.concat(...friendPosts)) //объединяем массив постов подписчиков(fiendId) и friendPost
    } catch (err) {
      res.status(500).json(err);
    }
  });

  module.exports = router