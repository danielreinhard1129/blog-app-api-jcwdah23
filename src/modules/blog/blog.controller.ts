import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { ApiError } from "../../utils/api-error";

export class BlogController {
  blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  createBlog = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) throw new ApiError("Thumbnail is required", 400);

    const authUserId = Number(res.locals.user.id);

    const result = await this.blogService.createBlog(
      req.body,
      thumbnail,
      authUserId
    );
    return res.status(200).send(result);
  };
}
