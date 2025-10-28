import type { Request, Response } from 'express';
import { uploadImage } from '../services/image-service.js';

const imageController = {
  /** 이미지 업로드 */
  async uploadImage(req: Request, res: Response) {
    const imageUrl = await uploadImage(req.file);
    res.status(200).json({ imageUrl });
  },
};

export default imageController;