const fs = require("fs/promises");
const path = require("path");

// Function to create the directory
const createDirectory = async (dirPath, fileObject) => {
  let fileInfoArray = fileObject;
  for (let obj of fileInfoArray) {
    const { folder } = obj;
    try {
      const fullPath = path.join(dirPath, folder);
      await fs.mkdir(fullPath, { recursive: true }); // Create directory if it doesn't exist
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log("Directory not found:", e);
      } else {
        console.log("Error creating directory:", e);
      }
    }
  }

  // Call moveFile once directories are created
  await moveFile(fileObject);
};

// Function to move file in the right folder
const moveFile = async (fileObject) => {
  for (let obj of fileObject) {
    const { oldPath, newPath } = obj;
    await fs.rename(oldPath, newPath); // Move file
  }
};

// Get clean data or filter clean data of files
const getAll = async (folderPath) => {
  const cleanData = [];
  const folderAllData = await fs.readdir(folderPath);
  const extensions = [
    { text: ["json", "txt", "csv"] },
    { music: ["mp3", "avi"] },
    { movies: ["mp4"] },
    { picture: ["jpg", "png", "jpeg", "gif"] },
    { documents: ["pdf", "docx", "docs", "xl", "csv"] },
  ];

  // To loop through each folder and file
  try {
    for (let data of folderAllData) {
      let oldPath = null;
      let newPath = null;
      let folder = null;
      const dataFullPath = path.join(folderPath, data);
      const dataInfo = await fs.stat(dataFullPath);
      if (dataInfo.isFile()) {
        oldPath = dataFullPath;
        const fileExtension = path.extname(dataFullPath);
        const cleanFileExtension = fileExtension.replace(".", ""); // Remove leading dot
        for (let obj of extensions) {
          for (let key in obj) {
            if (obj[key].includes(cleanFileExtension)) {
              newPath = path.join(folderPath, `${key}/${data}`);
              folder = key;
              break;
            }
          }
          if (newPath) break;
        }
        if (!newPath) {
          newPath = path.join(folderPath, `others/${data}`);
          folder = "others";
        }
        cleanData.push({ oldPath, newPath, folder });
      }
    }
    return cleanData;
  } catch (e) {
    console.log(`There occurred an error: ${e}`);
  }
};

// Main function
const main = async () => {
  const __currentDirectory = `your full path fo the directory`;
  const data = await getAll(__currentDirectory);
  await createDirectory(__currentDirectory, data);
};

main();
