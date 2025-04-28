const fs = require("fs/promises");
const path = require("path");

// Function to create the directory
const createDirectory = async (dirPath, fileObject) => {
  for (let obj of fileObject) {
    const { folder } = obj;
    try {
      const fullPath = path.join(dirPath, folder);
      await fs.mkdir(fullPath, { recursive: true }); // Create directory if it doesn't exist
    } catch (e) {
      console.error("Error creating directory:", e.message);
    }
  }

  // After creating folders, move files
  await moveFiles(fileObject);
};

// Function to move files to their respective folders
const moveFiles = async (fileObject) => {
  for (let obj of fileObject) {
    const { oldPath, newPath } = obj;
    try {
      await fs.rename(oldPath, newPath);
      console.log(`Moved: ${oldPath} → ${newPath}`);
    } catch (e) {
      console.error(`Failed to move ${oldPath} → ${newPath}:`, e.message);
    }
  }
};

// Function to get all files and decide their folder
const getAllFiles = async (folderPath) => {
  const cleanData = [];
  try {
    const folderItems = await fs.readdir(folderPath);
    const extensions = {
      text: ["json", "txt", "csv"],
      music: ["mp3", "avi"],
      movies: ["mp4"],
      picture: ["jpg", "png", "jpeg", "gif"],
      documents: ["pdf", "md", "docx", "docs", "xl", "csv"],
    };

    for (let item of folderItems) {
      const itemFullPath = path.join(folderPath, item);
      const itemInfo = await fs.stat(itemFullPath);

      if (itemInfo.isFile()) {
        const ext = path.extname(item).toLowerCase().slice(1); // Get extension without dot
        console.log(ext);
        let folderName = "others"; // Default folder

        for (let [folder, exts] of Object.entries(extensions)) {
          if (exts.includes(ext)) {
            folderName = folder;
            break;
          }
        }

        cleanData.push({
          oldPath: itemFullPath,
          newPath: path.join(folderPath, folderName, item),
          folder: folderName,
        });
      }
    }
    return cleanData;
  } catch (e) {
    console.error("Error reading folder:", e.message);
    return [];
  }
};

// Main function
const main = async () => {
  // Correct path here!
  // use "/" instead of "\" in the path
  const __currentDirectory = "Full folder path you want to organize";

  console.log("Organizing files in:", __currentDirectory);

  const data = await getAllFiles(__currentDirectory);

  if (data.length === 0) {
    console.log("No files found to organize.");
    return;
  }

  await createDirectory(__currentDirectory, data);

  console.log("✅ File organizing completed!");
};

// Run main
main();
