import fs from "node:fs";
import path from "node:path";
import { ProductExperience } from "@/components/ProductExperience";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getProductImages(): string[] {
  const dir = path.join(process.cwd(), "public", "product");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => `/product/${file}`);
}

export default function Home() {
  const images = getProductImages();
  return <ProductExperience images={images} />;
}
