import fs from 'fs';
import path from 'path';

const { copyFileSync, mkdirSync, readdirSync, lstatSync } = fs;

const buildOutputDir = 'public'; // Update this to match your build output directory
const targetDir = path.resolve('docs'); // Update this to match your desired target directory

const copyFiles = (sourceDir, targetDir) => {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  // Read files and directories in the source directory
  const files = readdirSync(sourceDir);

  // Iterate over each file or directory
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    // Check if it's a file or directory
    if (lstatSync(sourcePath).isFile()) {
      // Copy the file
      copyFileSync(sourcePath, targetPath);
    } else {
      // Recursively copy the subdirectory
      copyFiles(sourcePath, targetPath);
    }
  });
};

// Start copying files and directories
copyFiles(buildOutputDir, targetDir);
