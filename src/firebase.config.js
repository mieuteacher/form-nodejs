const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL, listAll } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyA2-lFmFa-JCNt3psT2PZ5EGomGDO8U8r4",
  authDomain: "meo-farmer.firebaseapp.com",
  projectId: "meo-farmer",
  storageBucket: "meo-farmer.appspot.com",
  messagingSenderId: "358148035486",
  appId: "1:358148035486:web:b7a64850f0be4766b33c8f",
  measurementId: "G-BDSCGF59W2"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

/* 
  1st param: your file, 2nd param: folder you need 
  Returns: 
    - If failed => false
    - If success => URL of the uploaded file
*/
async function uploadFileToStorage(fileUploads, folderName) { 

  // If the file is null, do nothing
  if (!fileUploads) { 
    return false;
  }

  // Convert the file to a format suitable for Firebase upload
  const fileRef = ref(storage, `${folderName}/` + fileUploads.name);

  // Upload the file to Firebase storage
  let url = await uploadBytes(fileRef, fileUploads).then(async (res) => {
    // When the upload is successful, retrieve the URL
    return await getDownloadURL(res.ref)
      .then((url) => url)
      .catch((er) => false);
  });

  return url;
}

async function uploadImgToStorage(name,fileUploads, folderName, typeFile) { 

  // If the file is null, do nothing
  if (!fileUploads) { 
    return false;
  }

  if (!typeFile) {
    return false;
  }
  // Convert the file to a format suitable for Firebase upload
  let fileRef = ref(storage, `${folderName}/` + name);

  const metadata = {
    contentType: `image/${typeFile}`
  };

  // Upload the file to Firebase storage
  let url = await uploadBytes(fileRef, fileUploads, metadata).then(async (res) => {
    // When the upload is successful, retrieve the URL
    return await getDownloadURL(res.ref)
      .then((url) => url)
      .catch((er) => false);
  });

  return url;
}
/* 
  Only parameter: folder name
  Returns: 
    - If failed => false
    - If success => array of URL links
*/
async function getFileInFolder(folderName) {
  const listRef = ref(storage, folderName);

  return await listAll(listRef).then(async (res) => {
    let result = []; // Create an empty array

    for (let i in res.items) { 
      let url = await getDownloadURL(res.items[i])
        .then((url) => url)
        .catch((er) => false);
      if (!url) {
        return false;
      }
      result.push(url);
    }

    return result;
  });
}

module.exports = {
  uploadFileToStorage,
  getFileInFolder,
  uploadImgToStorage
};
