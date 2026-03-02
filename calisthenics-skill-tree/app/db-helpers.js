import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

// get user's completed exercises
export async function getUserProgress(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data().completedExercises || [];
    }
    
    // if user document doesn't exist, create it
    await setDoc(doc(db, 'users', userId), {
      completedExercises: []
    });
    
    return [];
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
}

// this will mark exercise as complete
export async function markExerciseComplete(userId, exerciseId) {
  try {
    const userRef = doc(db, 'users', userId);
    
    // add exercise ID to completedExercises array (won't duplicate)
    await updateDoc(userRef, {
      completedExercises: arrayUnion(exerciseId)
    });
    
    return true;
  } catch (error) {
    // if document doesn't exist, create it
    if (error.code === 'not-found') {
      await setDoc(userRef, {
        completedExercises: [exerciseId]
      });
      return true;
    }
    
    console.error('Error marking exercise complete:', error);
    return false;
  }
}
// mark exercise as incomplete (remove from array)
export async function markExerciseIncomplete(userId, exerciseId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCompleted = userDoc.data().completedExercises || [];
      const updatedCompleted = currentCompleted.filter(id => id !== exerciseId);
      
      await updateDoc(userRef, {
        completedExercises: updatedCompleted
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error marking exercise incomplete:', error);
    return false;
  }
}
// check if exercise is completed
export function isExerciseCompleted(completedExercises, exerciseId) {
  return completedExercises.includes(exerciseId);
}
