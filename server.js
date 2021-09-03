const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const { Schema } = mongoose;

mongoose.connect('mongodb+srv://newUserDB:senhadb@cluster0.apjfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true   }).then(x => {
            console.log(
                `Connected to Mongo! Database name: "${x.connections[0].name}"`,
            );
        })
        .catch(err => {
            console.error('Error connecting to mongo', err);
        });



app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({ extended: false }))
  

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


let execiseSchema = new Schema({
  description: {type: String, required: true},
  duration: {type: String, required: true},
  date: String
})

let userSchema = new Schema({
  username: {type:String, required: true},
  log: [execiseSchema]
})

let Session = mongoose.model('Session', execiseSchema)
let User = mongoose.model("Users", userSchema)

app.post("/api/users", (req, res)=>{
  
  let name = req.body.username;
  let object = {}
  let newUser = new User({username: name})
  //console.log(name)
  
  newUser.save((err, saved)=>{
    if(!err){
      //console.log(saved.username)
      object['username'] = saved.username
      object['_id'] = saved.id
      res.json(object)
      return
    }
  })
})

app.get("/api/users", (req, res)=>{
  
  User.find({}, (err, arrayOfUsers)=>{
    if(!err){
      res.json(arrayOfUsers)
    }
  })
})


app.post("/api/users/:_id/exercises", (req, res)=>{
  let data = req.body.date
  
  if(data === ''){
    data = new Date().toDateString().substring(0, 10)
  }
  

  let newSession = new Session({
    description: req.body.description,
    duration: Number(req.body.duration),
    date: data
  })



  let object = {}

  User.findById({_id:req.params._id}, (err, user)=>{
    if(!err){
      user.log.push(newSession)
      user.save((err, result)=>{
        if(!err){
          // console.log(result.id)
          
          // object['id'] = result.id
          
          object['_id'] = result.id
          object['username'] = result.username
          object['date'] = new Date(data).toDateString()
          object['duration'] = Number(newSession.duration)
          object['description'] = newSession.description
          

          res.json(object)
        }
      })
    }
  })

  
})
  // User.findOneAndUpdate(
  //   req.params._id,
  //   {$push: {log: newSession}},
  //   {new: true}, (err, user) =>{
  //     if(!err){
  //       console.log(user.id)
  //       let object = {}
  //       object['_id'] = user.id
  //       object['username'] = user.username
  //       object['date'] = new Date(data).toDateString()
  //       object['description'] = newSession.description
  //       object['duration'] = newSession.duration
  //       res.json(object)
  //     }
  //   }
  // )


app.get("/api/users/:id/logs", (req, res)=>{
  


  User.findById(req.params.id, (err, result)=>{
    if(!err){
      let object = {'_id': result.id,
                    'username': result.username,
                    'count': result.log.length,
                    'log': result.log}

      let log = []
      for(let i in result.log){
        let date = result.log[i].date
        if(date == undefined){
          date =  new Date()
        }
        date = new Date(date)
        date = date.toDateString()


        let a = {'description':result.log[i].description,
                  "duration": Number(result.log[i].duration),
                  'date': date
        }
        
        log.push(a)
      }
      

      object['log'] = log

      console.log(req.url)
      // console.log(req.query.from)
      // console.log(req.query.to)
      
      
      if(req.query.from || req.query.to){
        // console.log('Aqui 1')
        let fromDate = new Date(0)
        let toDate = new Date()
      
       if(req.query.from){
        //  console.log('Aqui 2')
          fromDate = new Date(req.query.from)
        }

        if(req.query.to){
          // console.log('Aqui 3')
          toDate = new Date(req.query.to)
        }
      
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()

        object.log = object.log.filter((session)=>{
        let sessionDate = new Date(session.date).getTime()

        return sessionDate >= fromDate && sessionDate <= toDate
        })

      }

      
      if(req.query.limit){
          console.log('Entrou')
          object.log = object.log.slice(0, req.query.limit)}


      object['count'] = result.log.length
     
      res.json(object)
    }
      })
    
  //     

  //      



  //       
  //     }

  //     

  //     

  //     
  //   }
    
  })
  
  
