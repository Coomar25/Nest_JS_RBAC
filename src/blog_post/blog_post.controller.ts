import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Version,
  ParseIntPipe,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import { BlogPostService } from './blog_post.service';
import {
  BlogCatgoryDto,
  BlogCommentDto,
  CreateBlogPostDto,
  OrderByDto,
  SubscribeBlogDto,
} from './dto/create-blog_post.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/entities/roles.decorator';
import { RoleEnum } from 'src/constants/enum';
import { LikeDislikeDto } from './dto/like-dislike-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogBookMarksServices } from './services/blog_bookmarks.service';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { BlogApproveService } from './services/blog_approve.service';
import { BlogSubscribeLetter } from './services/blog_subscribe_letter.service';
import { ParsePositiveIntPipe } from './pipes/positive-integer-parse-pipe';
import { UpdateBlogCategoryDto } from './dto/update-blog_post.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Blog-Posts')
@ApiBearerAuth('jwt')
@Controller('blog-post')
export class BlogPostController {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly blogBookMarksService: BlogBookMarksServices,
    private readonly blogApproveService: BlogApproveService,
    private readonly blogSubscriveLetter: BlogSubscribeLetter,
  ) {}

  @ApiOperation({
    description: 'Get All Blog Post',
    summary: 'Get All Blog Post',
    deprecated: true,
  })
  @Post('category')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  callBlogCategory(@Body() blogCategoryDto: BlogCatgoryDto) {
    return this.blogPostService.createBlogCategory(blogCategoryDto);
  }

  @ApiOperation({
    description: 'Get All Blog Post',
    summary: 'Get All Blog Post',
    deprecated: true,
  })
  @Patch('category/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  callUpdateCategory(
    @Param(
      'blog_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    blog_id: number,
    @Request() req: any,
    @Body() updateCategory: UpdateBlogCategoryDto,
  ) {
    return this.blogPostService.updateBlogCategory(blog_id, updateCategory);
  }

  @Patch('approve/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  callBlogApprove(
    @Param(
      'blog_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
      ParsePositiveIntPipe,
    )
    blog_id: number,
  ) {
    return this.blogApproveService.approveBlogPost(blog_id);
  }

  @Get('search/:page/:perPage')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  callgetFilteredUnapproved(
    @Param(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    page: number,
    @Param(
      'perPage',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    perPage: number,
    @Query('orderBy') orderBy: OrderByDto,
    @Query('category') category: string,
  ) {
    console.log(page, perPage, category, orderBy);
    return this.blogApproveService.getFilteredUnapprovedBlog(
      page,
      perPage,
      category,
      orderBy,
    );
  }

  //simple example of files upload in desired fodlers
  // @Post('/uploads')
  // @Version('1')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         cb(null, `${file.originalname}`);
  //       },
  //     }),
  //   }),
  // )
  // async uploadFile(@UploadedFile() file: any) {
  //   console.log(file);
  //   return {
  //     message: 'File uploaded successfully',
  //   };
  // }
  @Post('/uploads')
  @Version('1')
  @UseInterceptors(FileInterceptor('file', new FileStorageService()))
  async uploadFile(@UploadedFile() file: any) {
    console.log(file);
    return {
      message: 'File uploaded successfully',
    };
  }

  /**
   * Create a new blog post.
   *
   * @param createBlogPostDto - The data for creating the blog post.
   * @param req - The request object.
   * @returns The created blog post.
   */
  @Post('create')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseInterceptors(FileInterceptor('file', new FileStorageService()))
  callCreateBlog(
    @Body() createBlogPostDto: CreateBlogPostDto,
    @Request() req: any,
    @UploadedFile()
    file: any,
  ) {
    console.log('🚀 ~ BlogPostController ~ file:', file);
    return this.blogPostService.create(createBlogPostDto, req, file);
  }

  @Post('likedislike/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  callLikeDislike(
    @Param(
      'blog_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    blog_id: number,
    @Body() likedislikedto: LikeDislikeDto,
    @Request() req: any,
  ) {
    return this.blogPostService.likeDislike(blog_id, likedislikedto, req);
  }

  @Post('comment/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  callBlogComment(
    @Param(
      'blog_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    blog_id: number,
    @Body() blogCommentDto: BlogCommentDto,
    @Request() req: any,
  ) {
    return this.blogPostService.createBlogComment(blog_id, blogCommentDto, req);
  }

  @Get('all-blog-post')
  @Version('1')
  callallBlogPosts() {
    return this.blogPostService.allBlogPost();
  }

  @Post('bookmarks/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  callBlogBookmarks(
    @Param(
      'blog_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    blog_id: number,
    @Request() req: any,
  ) {
    return this.blogBookMarksService.blogBoorkmarks(blog_id, req);
  }

  @Get('user/get-bookmarks')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  callSingleUserBM(@Request() req: any) {
    return this.blogBookMarksService.getSingleUsrBlogBookmarks(req);
  }

  @Delete('bookmarks/:blog_id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  callRemoveBlogBookmarks(
    @Param(
      'blog_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    blog_id: number,
    @Request() req: any,
  ) {
    return this.blogBookMarksService.removeBlogBookmarks(blog_id, req);
  }

  @Post('subscribe')
  @Version('1')
  callSubscribeBlog(@Body() subscribeDto: SubscribeBlogDto) {
    console.log(
      '🚀 ~ BlogPostController ~ callSubscribeBlog ~ subscribeDto:',
      subscribeDto,
    );
    return this.blogSubscriveLetter.createBlogSubscribeLetter(subscribeDto);
  }
}
