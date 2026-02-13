import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function convertPngToWebp(inputPath, outputPath) {
  try {
    await execAsync(`cwebp -q 90 "${inputPath}" -o "${outputPath}"`);
    console.log(`✓ 已转换: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`✗ 转换失败: ${inputPath}`, error.message);
    throw error;
  }
}

async function convertAllImages() {
  const publicDir = "./public";

  // 转换 FacesHi 目录中的所有 PNG
  const facesDir = join(publicDir, "FacesHi");
  const faceFiles = await readdir(facesDir);

  console.log("\n开始转换 FacesHi 目录中的图片...");
  for (const file of faceFiles) {
    if (file.endsWith(".png")) {
      const inputPath = join(facesDir, file);
      const outputPath = join(facesDir, file.replace(".png", ".webp"));
      await convertPngToWebp(inputPath, outputPath);
    }
  }

  // 转换 icon.png
  console.log("\n转换 icon.png...");
  const iconInput = join(publicDir, "icon.png");
  const iconOutput = join(publicDir, "icon.webp");
  await convertPngToWebp(iconInput, iconOutput);
}

async function updateJsonFiles() {
  console.log("\n更新 JSON 数据文件...");

  const jsonFiles = [
    "./public/data/correct_name_list.json",
    "./public/data/correct_fates_list.json",
    "./public/data/faces_data.json",
  ];

  for (const filePath of jsonFiles) {
    const content = await readFile(filePath, "utf-8");
    const updated = content.replace(/\.png"/g, '.webp"');
    await writeFile(filePath, updated, "utf-8");
    console.log(`✓ 已更新: ${filePath}`);
  }
}

async function main() {
  console.log("=== PNG 转 WebP 转换工具 ===\n");

  try {
    // 检查 cwebp 是否安装
    try {
      await execAsync("cwebp -version");
    } catch (error) {
      console.error("错误: 未找到 cwebp 工具");
      console.error("请先安装 webp:");
      console.error("  Ubuntu/Debian: sudo apt-get install webp");
      console.error("  macOS: brew install webp");
      console.error(
        "  Windows: 从 https://developers.google.com/speed/webp/download 下载",
      );
      process.exit(1);
    }

    await convertAllImages();
    await updateJsonFiles();

    console.log("\n✓ 所有转换完成！");
    console.log("\n请运行以下命令删除原始 PNG 文件:");
    console.log("  rm public/FacesHi/*.png public/icon.png");
  } catch (error) {
    console.error("\n✗ 转换过程中出错:", error);
    process.exit(1);
  }
}

main();
