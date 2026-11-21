import { Request, Response } from "express";
import * as productRepo from "@/repositories/product-repository";

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

// I-check ang tinuod nga klase sa file (dili ang ngalan o extension lang)
const detectImageType = (buf: Buffer): string | null => {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length > 8 && buf.subarray(0, 8).equals(pngSignature)) {
    return "image/png";
  }
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
};

// Public: ang picture sa product
export const getProductImage = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).end();

  const image = await productRepo.getImage(id);
  if (!image) return res.status(404).end();

  res.set({
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    // Kinahanglan kini aron ma-load ang picture sa frontend (lahi nga domain)
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  res.send(image.data);
};

// Admin: i-upload ang picture
export const uploadProductImage = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Please choose an image" });
  }

  const contentType = detectImageType(req.file.buffer);
  if (!contentType) {
    return res
      .status(400)
      .json({ message: "Only JPG, PNG, or WebP images are allowed" });
  }

  const product = await productRepo.setImage(id, req.file.buffer, contentType);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

// Admin: tangtangon ang picture
export const deleteProductImage = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = await productRepo.removeImage(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};