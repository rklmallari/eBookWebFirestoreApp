
'use strict';

function eBookShare() {
  this.checkSetup();

  this.userName = document.getElementById('user-name');
  this.myCollTab = document.getElementById('my-collection');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.userPic = document.getElementById('user-pic');
  this.uploadForm =document.getElementById('uploadForm');
  this.uploader = document.getElementById('uploader');
  this.bookTitle = document.getElementById('bookTitle');
  this.optGenre = document.getElementById('optGenre');
  this.myProfile = document.getElementById('section3');
  this.myCollection = document.getElementById('section2');
  this.userNameField = document.getElementById('userNameField');
  this.screenNameField = document.getElementById('screenNameField');
  this.selfIntro = document.getElementById('selfIntro');
  this.uploadBox = document.getElementById('uploadBox');
  this.description = document.getElementById('description');
  this.updProfButton = document.getElementById('updProfButton');
  this.searchButton = document.getElementById('searchButton');
  this.searchText = document.getElementById('searchText');
  this.searchList = document.getElementById('searchList');
  this.testButton = document.getElementById('testButton');
  this.testArea = document.getElementById('testArea');

  this.searchButton.addEventListener('click', this.searchBook.bind(this));

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.updProfButton.addEventListener('click', e => {
    this.updateUser(this.auth.currentUser);
  });

  this.uploadBox.addEventListener('change', this.upload.bind(this));

  this.testButton.addEventListener('click', this.testFirestore.bind(this));

  this.initFirebase();
}

eBookShare.prototype.initFirebase = function () {

  // firebase.initializeApp({
  //   apiKey: 'AIzaSyCu8EI7cyQjMUM9HDQJzgE_aMo31X7LPrs',
  //   authDomain: 'ebookwebappfirestore.firebaseapp.com',
  //   projectId: 'ebookwebappfirestore'
  // });

  // firebase.firestore().settings({
  //   // Enable offline support
  //   persistence: true
  // });

  this.auth = firebase.auth();
  this.database = firebase.firestore();
  this.storage = firebase.storage();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

eBookShare.prototype.signOut = function () {
  this.auth.signOut();
  console.info("User logged out.");
  location.reload();
}

eBookShare.prototype.signIn = function () {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    'prompt': 'select_account'
  });
  const promise = this.auth.signInWithPopup(provider);
  console.info("User logged in.");
  promise.catch(e => console.log(e.message));
}

eBookShare.prototype.upload = function (e) {
  e.preventDefault();

  if(screenNameField.value == "" || screenNameField.value == null) {
      alert("Please update your profile first. Screen Name is required before uploading any eBook.");
      window.uploadForm.reset();
    } else if(bookTitle.value == "" || bookTitle.value == null || 
      description.value== "" || description.value == null || 
      optGenre.value == "" || optGenre.value == null) {
      alert("Ensure to populate below fields before uploading: \nTitle, Description, Genre");
      window.uploadForm.reset();
    } else {
      var file = e.target.files[0];
      var metadata = {
          'contentType': file.type
      };
      var storageRef = this.storage.ref('ebooks/' + firebase.auth().currentUser.uid + "/" + firebase.auth().currentUser.uid + '_' + bookTitle.value);

      var task = storageRef.put(file, metadata);

      task.on('state_changed', 

        function(snapshot) {
          var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) *100;
          uploader.value = percentage;
          console.log('Uploaded', snapshot.totalBytes, 'bytes.');
        },
        function(error) {
          console.error('Upload failed:', error);
          alert('Upload failed! Ensure that you are uploading a file with acceptable format.')
        },
        function() {
            this.downloadUrl = task.snapshot.downloadURL;

            var inputData = {
                description: description.value,
                downloads : 0,
                downloadUrl: this.downloadUrl,
                genre: optGenre.value,
                title: bookTitle.value,
                authorId: firebase.auth().currentUser.uid,
                authorPic: firebase.auth().currentUser.photoURL
            };

            var bookRef = firebase.firestore().collection("books");

            bookRef.add(inputData)
            .then(function(book) {
              console.log("eBook successfully added!");
              uploader.value = 0;
              window.uploadForm.reset();
              window.bookForm.reset();
            }).catch(function(error) {
              console.error("Error adding eBook: ", error);
            });
        }
      );

    }
}

eBookShare.prototype.onAuthStateChanged = function(user) {
  if (user) { 
    var userName = user.displayName;

    this.userName.textContent = userName;
    this.myCollTab.textContent = ">My Collection";
    this.checkUserExist(user);

    this.userName.removeAttribute('hidden');
    this.myCollTab.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');
    this.myProfile.removeAttribute('hidden');
    this.myCollection.removeAttribute('hidden');
    this.uploadBox.disabled = false;
    this.bookTitle.disabled = false;
    this.description.disabled = false;
    this.optGenre.disabled = false;
    this.searchButton.disabled = false;
    this.searchText.disabled = false;
    this.userNameField.setAttribute('value', userName);
    this.userPic.setAttribute('src', user.photoURL);

    this.retrieveUser(user);
    this.retrieveUserCollection(user);
    this.signInButton.setAttribute('hidden', 'true');

  } else {
    this.userName.setAttribute('hidden', 'true');
    this.myCollTab.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    this.myProfile.setAttribute('hidden', 'true');
    this.myCollection.setAttribute('hidden', 'true');
    this.uploadBox.disabled = true;
    this.bookTitle.disabled = true;
    this.description.disabled = true;
    this.optGenre.disabled = true;
    this.searchButton.disabled = true;
    this.searchText.disabled = true;

    this.signInButton.removeAttribute('hidden');
  }
};

eBookShare.prototype.checkUserExist = function (user) {
  var userRef = this.database.collection("authors").doc(user.uid);

  userRef.get().then(function(doc) {
    if (doc.exists) {
      userRef.update({
        profilePic : user.photoURL,
        userName : user.displayName
      }).then(function() {
        console.log("User/Author successfully updated!");
      }).catch(function(error) {
        console.error("Error updating user/author: ", error);
      });
      console.log("User/Author exists.");
    } else {
      userRef.set({
        profilePic : user.photoURL,
        userName : user.displayName,
        selfIntro : "<insert brief bio here>",
        screenName : $.trim(user.displayName.toLowerCase())
      }).then(function() {
        console.log("User/Author successfully saved!");
      }).catch(function(error) {
        console.error("Error saving user/author: ", error);
      });
      console.log("User/Author not found!");
    }
  }).catch(function(error) {
      console.log("Error getting user/author from Firestore:", error);
  });

}

eBookShare.prototype.updateUser = function(user) {
  if(screenNameField.value == "" || screenNameField.value == null) {
      alert("Screen Name is required.");
    } else {
      var updProfPost = {
        screenName : screenNameField.value,
        selfIntro : selfIntro.value
      };
      var userRef = this.database.collection("authors").doc(user.uid);
      userRef.update(updProfPost)
      .then(function() {
        console.log("User/Author successfully updated!");
      })
      .catch(function(error) {
        console.error("Error updating user/author: ", error);
      });
      console.log("User/Author updated on Firestore.");
      alert("Profile updated!");
    }
}

eBookShare.prototype.retrieveUser = function(user) {
  var userRef = this.database.collection("authors").doc(user.uid).get().then(function(doc) {
    if (doc.exists) {
      screenNameField.setAttribute("value", doc.data().screenName);
      selfIntro.value = doc.data().selfIntro;
      console.log("User/Author retrieved!");
    } else {
      console.log("User/Author not found!");
    }
  }).catch(function(error) {
      console.log("Error retrieving user/author:", error);
  });
}

eBookShare.prototype.retrieveUserCollection = function(user) {

  var bookRef = this.database.collection("books");

  var query = bookRef.where("authorId", "==", user.uid).onSnapshot(function(querySnapshot) {
    $('#bookList').empty();
    if(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if (doc.exists) {
          var objects = doc.data();
          $('#bookList').append($('<li/>',{
            html: '<a style="color:white; font-weight:900" href="' + objects.downloadUrl + '" title="View '+ objects.title + '">' + objects.title + 
            ' </a> <button onClick="deleteBook(\'' + doc.id + '\', \'' + objects.title + '\');" class="fa fa-remove" title="Remove" style="color:red; border:none; background-color:transparent" /><br>Description: '
            + objects.description + '<br>Genre: ' + objects.genre + '<br>Total downloads: ' + objects.downloads + "<br><br>"
            }));
          console.log("eBooks have been found for user.");
        }
      });
    } else {
      $('#bookList').append($('<li/>',{
        html: "No eBook(s) uploaded yet.<br><br>"
      }));
      console.log("No eBooks have been found for user.");
    }
  });
}

eBookShare.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

eBookShare.prototype.searchBook = function (e) {
  e.preventDefault();

  var bookRef = this.database.collection("books");

  var query = bookRef.where("title", "==", this.searchText.value).onSnapshot(function(querySnapshot) {
    $('#searchList').empty();
    if(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if(doc.exists) {
          var objects = doc.data();
          $('#searchList').append($('<li/>',{
            html: '<a style="color:black; font-weight:900" href="' + objects.downloadUrl + '" title="Download '+ objects.title + 
            '" target="_blank" onClick="return plusDownload(\'' + doc.id + '\');">' + objects.title + 
            ' <i class="fa fa-download"></i></a><br>Author: <img style="width:20px; height:auto" src="' + objects.authorPic + '" /><br>Description: ' 
            + objects.description + '<br>Genre: ' + objects.genre + '<br>Total downloads: ' + objects.downloads + "<br><br>"
          }));
        }
      });
    } else {
      $('#searchList').append($('<li/>',{
        html: "No eBook(s) searched with this keyword.<br><br>"
      }));
      console.log("No eBook(s) have been found.");
    }
  });
}

function deleteBook(bookId, bookTitle) {

  var confirmDelete = confirm("Are you sure you want to delete this book?");

  if (confirmDelete) {
    var bookRef = firebase.firestore().collection("books");
    var currentUserUid = firebase.auth().currentUser.uid;

    bookRef.doc(bookId).delete().then(function() {
      var bookStorageRef = firebase.storage().ref('ebooks/' + currentUserUid);
      bookStorageRef.child(currentUserUid + '_' + bookTitle).delete()
      .then(e => {
        console.log("eBook has been removed from cloud storage.");
      })
      .catch(e => {
        console.error("Failed to delete ebook from cloud storage.", e.message);
      });
      console.log("eBook successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
  }
}

function plusDownload(bookId) {
  var rootRef = firebase.database().ref();
  var downloadCount;

  var bookRef = firebase.firestore().collection("books").doc(bookId);

  bookRef.get().then(function(doc) {
    var downloadCount = doc.data().downloads;
    console.log("Download count: " + downloadCount);

    bookRef.update({
      downloads: downloadCount+1
    }).then(function () {
      console.log("Download count updated.");
    }).catch(function (error) {
      console.error("Error updating download count:", error)
    });
  }).catch(function(error) {
      console.log("Error retrieving eBook:", error);
  });
}

$('#searchText').keypress(function(e){
  if(e.keyCode == 13){
    $('#searchButton').click();
  }
});

window.onload = function() {
  window.eBookShare = new eBookShare();
};

$(document).ready(function(){/* activate scrollspy menu */
$('body').scrollspy({
  target: '#navbar-collapsible',
  offset: 50
});

$('form').keypress(function(event) { 
  return event.keyCode != 13;
});

/* smooth scrolling sections */
$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top - 50
        }, 1000);
        return false;
      }
    }
});

eBookShare.prototype.testFirestore = function() {
  var testRef = this.database.collection("test").doc("1").collection("Address").doc("2").get().then(function(doc) {
    if (doc.exists) {
      testArea.value = doc.data().city;
      console.log("City was successfully retrieved!");
    } else {
      console.log("City was not successfully retrieved!");
    }
  }).catch(function(error) {
      console.log("Error retrieving city:", error);
  });
}

});