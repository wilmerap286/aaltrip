import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDtXNHcx4TlgczjSKJf5772ESL1ZodW8ic",
  authDomain: "aaltrip.firebaseapp.com",
  databaseURL: "https://aaltrip.firebaseio.com",
  projectId: "aaltrip",
  storageBucket: "aaltrip.appspot.com",
  messagingSenderId: "433437165376",
  appId: "1:433437165376:web:2007d65af272aa540f9ca5"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);

/*The core Firebase JS SDK is always required and must be listed first
<script src="https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js"></script>

TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries

<script>
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDtXNHcx4TlgczjSKJf5772ESL1ZodW8ic",
    authDomain: "aaltrip.firebaseapp.com",
    databaseURL: "https://aaltrip.firebaseio.com",
    projectId: "aaltrip",
    storageBucket: "aaltrip.appspot.com",
    messagingSenderId: "433437165376",
    appId: "1:433437165376:web:2007d65af272aa540f9ca5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
</script>*/
