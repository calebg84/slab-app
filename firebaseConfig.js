// import firebase from 'firebase'
// import 'firebase/firestore'
// import 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAT58uBeWqGHpk4c9no5AowN8grjvO9LCc',
  authDomain: 'sawmill-site.firebaseapp.com',
  databaseURL: 'https://sawmill-site.firebaseio.com',
  projectId: 'sawmill-site',
  storageBucket: 'sawmill-site.appspot.com',
  messagingSenderId: '240175581510',
  appId: '1:240175581510:web:1705fb3d350ee5e7827d47',
}

export const app = initializeApp(firebaseConfig)
// const storage = firebase.storage()
// const db = getFirestore()
// const storage = getStorage(app)

// export { storage, db, firebase as default }
// export { db, storage }
