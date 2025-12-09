import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generate-slug";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBlogDTO } from "./dto/create-blog.dto";
import { GetBlogsDTO } from "./dto/get-blogs.dto";

export class BlogService {
  prisma: PrismaService;
  cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  createBlog = async (
    body: CreateBlogDTO,
    thumbnail: Express.Multer.File,
    authUserId: number
  ) => {
    // 1. cari dulu data blog di db berdasarkan title
    const blog = await this.prisma.blog.findFirst({
      where: { title: body.title },
    });

    // 2. kalo sudah ada throw error
    if (blog) throw new ApiError("Title already exist", 400);

    // 3. upload thumbnail ke cloudinary
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    const slug = generateSlug(body.title);

    // 4. create data blog baru
    await this.prisma.blog.create({
      data: {
        ...body,
        slug: slug,
        thumbnail: secure_url,
        userId: authUserId,
      },
    });

    return { message: "create blog success" };
  };

  getBlogs = async (query: GetBlogsDTO) => {
    const { page, take, sortBy, sortOrder, search } = query;

    const whereClause: Prisma.BlogWhereInput = {};

    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    const blogs = await this.prisma.blog.findMany({
      where: whereClause,
      take: take,
      skip: (page - 1) * take,
      orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { name: true } } },
    });

    const total = await this.prisma.blog.count({ where: whereClause });

    return {
      data: blogs,
      meta: { page, take, total },
    };
  };
}
