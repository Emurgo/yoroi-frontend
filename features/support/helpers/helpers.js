export const checkIfElementsInArrayAreUnique = async function (arr) {
    arr.sort();
     for (let i = 0; i < arr.length; i++) {
         if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) { 
             return false; 
         } 
     } 
     return true;
 }