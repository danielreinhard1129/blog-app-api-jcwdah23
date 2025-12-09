import { Router } from "express";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { BlogController } from "./blog.controller";
import { CreateBlogDTO } from "./dto/create-blog.dto";

export class BlogRouter {
  router: Router;
  blogController: BlogController;
  jwtMiddleware: JwtMiddleware;
  uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.blogController = new BlogController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      validateBody(CreateBlogDTO),
      this.blogController.createBlog
    );
    this.router.get("/", this.blogController.getBlogs);
  };

  getRouter = () => {
    return this.router;
  };
}
