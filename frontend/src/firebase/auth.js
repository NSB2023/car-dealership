import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "./config"

const googleProvider = new GoogleAuthProvider()

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider)

export const logout = () => signOut(auth)

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)
