var port = process.env.PORT || 5000;
var express = require('express');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

var firebase = require("firebase");
var config = {
    apiKey: "AIzaSyAUEi-3cdDLFrz801hUBhirTZvJRJYfrYw",
    authDomain: "test-7ded8.firebaseapp.com",
    databaseURL: "https://test-7ded8.firebaseio.com",
    storageBucket: "test-7ded8.appspot.com",
    messagingSenderId: "566084249826"
};
firebase.initializeApp(config);
var database = firebase.database();
var totalChildren = 0;
var items = [];
var itemId;
	
var cons = require('consolidate');
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(expressSession({
    secret: 'MusSecret'
}));
app.use(bodyParser());
app.use("/public", express.static(__dirname + "/public"));

var server = app.listen(port);

/*firebase.auth().onAuthStateChanged(function(user) {
if (user) {
console.log('onAuthStateChanged: ' + user.email);
res.redirect('/main');
} else {
console.log('no user');
}
});*/

app.get('/', function(req, res) {
    /*var user = firebase.auth().currentUser;
    if (user) {
    	res.redirect('/main');
    } else {
    	res.render('index');
    }*/
    if (req.session.email)
        res.redirect('/main');
    else
        res.render('index');
});

app.get('/main', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    if (req.session.email) {
        res.render('main', {
            email: req.session.email
        });
    } else
        res.redirect('/');
});

app.get('/addItem', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    if (req.session.email) {
        res.render('addItem', {email: req.session.email});
    } else
        res.redirect('/');

});

app.get('/myItems', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');


    if (req.session.email){
		res.render('myItems', {
            items: items,
            email: req.session.email
        });
    }
    else {
      res.redirect('/');
    }


});

app.get('/item/:itemName', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    if (req.session.email){
      var itemName = req.params.itemName;
      var isItem = false;
      var theItem;
	  for (var i = 0; i < items.length; i++) {
		if(itemName == items[i].itemName){
                isItem = true;
                theItem = items[i];
				itemId = items[i].id;
				console.log(itemId);
              }
	  }
	/*items[0].forEach(function(childItem) {
              if(itemName == childItem.val().itemName){
                isItem = true;
                theItem = childItem.val();
				itemId = childItem.val().id;
				console.log(itemId);
              }
          });*/
          if(isItem){
            console.log(theItem);
            res.render('itemDetails', {
                item: theItem,
                email: req.session.email
            });
          }

          else{
            console.log('There is no Item like ' + itemName);
            res.redirect('/');
          }
    }
    else {
      res.redirect('/');
    }

});

app.get('/information', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    if (req.session.email) {
        res.render('information', {
            email: req.session.email
        });
    } else
        res.redirect('/');

    /*var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      var username = snapshot.val().username;
      var email = snapshot.val().email;
      console.log(username);
      console.log(email);
    });*/
});

app.get('/signup', function(req, res) {
    //To prevent the browsers back button from accessing restricted information
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    if (req.session.email) {
        res.redirect('/');
    } else {
        res.render('signup', {});
    }
});

app.get('/logOut', function(req, res) {
    delete req.session.email;
    firebase.auth().signOut().then(function() {
        console.log('Sign Out Successful.');
    }, function(error) {
        console.log('Sign Out Error.');
    });
    res.redirect('/');
});

app.post('/login', function(req, res) {
    delete req.session.email;
    var post = req.body;

    firebase.auth().signInWithEmailAndPassword(post.email, post.password).then(function(user) {
        console.log('Log in: ' + user.email);
        req.session.email = post.email;
	firebase.database().ref('/users/' + firebase.auth().currentUser.uid).on('value', function(snapshot){
		items = [];
		totalChildren = 0;
		snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            totalChildren++;
            items.push(childSnapshot.val())
        });
		console.log(items[0]);
        console.log('Total Children Count: ' + totalChildren);
	});
        res.redirect('/main');
    }).catch(function(error) {
        var errorMessage = error.message;
        res.render('index', {
            message: 'Wrong Email or Password'
        });
        console.log(errorMessage);
    });

});

app.post('/signup', function(req, res) {
    var post = req.body;

    firebase.auth().createUserWithEmailAndPassword(post.email, post.password).then(function(user) {
        console.log('User Created: ' + user.email);
        res.render('signup', {
            message: user.email + ' added.'
        });
    }).catch(function(error) {
        var errorMessage = error.message;
        console.log('createUserWithEmailAndPassword Error: ' + errorMessage);
        res.render('signup', {
            message: 'This Email is used by someone else.'
        });
    });

});

app.post('/dbPush', function(req, res) {
    var post = req.body;
	var postData1 = {
		id: '',
        itemName: post.itemName,
        option1: {
            option1_1: post.option1_1,
            option1_2: post.option1_2
        },
        option2: post.option2,
        option3: post.option3
	};
    var message = '';
    if(post.itemName != ""){
		var myRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid).push(postData1);
		var key = myRef.key;
		var postData2 = {
		id: key,
        itemName: post.itemName,
        option1: {
            option1_1: post.option1_1,
            option1_2: post.option1_2
        },
        option2: post.option2,
        option3: post.option3
		};
		myRef.update(postData2).then(function(user) {
        message = 'Item added.';
        res.render('addItem', {email: req.session.email, message: message});
      }).catch(function(error) {
          var errorMessage = error.message;
          console.log(errorMessage);
          message = errorMessage;
          res.render('addItem', {email: req.session.email, message: message});
      });
    }
    else{
      message = 'Item Name cannot be blank.';
      res.render('addItem', {email: req.session.email, message: message});
    }
});

app.post('/dbUpdate', function(req, res) {
    var post = req.body;

    var postData = {
        itemName: post.itemName,
        option1: {
            option1_1: post.option1_1,
            option1_2: post.option1_2
        },
        option2: post.option2,
        option3: post.option3
    };

    var message = '';
    if(post.itemName != ""){
      firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/' + itemId).update(postData).then(function(user) {
        message = 'Item updated.';
        res.render('itemDetails', {email: req.session.email, message: message});
      }).catch(function(error) {
          var errorMessage = error.message;
          console.log(errorMessage);
          message = errorMessage;
          res.render('itemDetails', {email: req.session.email, message: message});
      });
    }
    else{
      message = 'Item Name cannot be blank.';
      res.render('itemDetails', {email: req.session.email, message: message});
    }
});

app.all('*', function(req, res) {
    res.redirect('/');
});

console.log('Working.');
