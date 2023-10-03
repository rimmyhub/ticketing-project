import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { Show } from './entities/show.entity';
import { PageReqDto, SearchReqDto } from 'src/commons/dto/page-req.dto';
import { MessageResDto } from 'src/commons/dto/message-res.dto';

@Controller('api/shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  // 공연 검색
  @Post('search')
  async searchShow(@Body('keyword') keyword: string): Promise<Show[]> {
    const shows = await this.showsService.searchShow({ keyword });
    return shows;
  }

  // // 공연 검색
  // @Get('search')
  // async searchShow(@Query() searchReqDto: SearchReqDto): Promise<Show[]> {
  //   const shows = await this.showsService.searchShow({ searchReqDto });
  //   return shows;
  // }

  // 공연 생성
  @UseGuards(AccessAuthGuard)
  @Post()
  async createShow(
    @Body() createShowDto: CreateShowDto,
    @User() user: UserAfterAuth,
  ): Promise<Show> {
    return await this.showsService.createShow({
      createShowDto,
      userId: user.id,
    });
  }

  // 내가 생성한 공연 조회
  @UseGuards(AccessAuthGuard)
  @Get('my')
  async findAllMyShow(
    @User() user: UserAfterAuth,
    @Query() pageReqDto: PageReqDto,
  ): Promise<[Show[], number]> {
    const shows = await this.showsService.findAllMyShow({
      pageReqDto,
      userId: user.id,
    });
    return shows;
  }

  // 공연 조회
  @Get()
  async findAllShow(
    @Query() pageReqDto: PageReqDto,
  ): Promise<[Show[], number]> {
    return await this.showsService.findAllShow({ pageReqDto });
  }

  // 공연 상세 조회
  @Get(':showId')
  async findOneShow(@Param('showId') showId: string): Promise<Show> {
    return await this.showsService.findOneShow({ showId });
  }

  // 공연 수정
  @UseGuards(AccessAuthGuard)
  @Patch(':showId')
  async updateShow(
    @Param('showId') showId: string,
    @User() user: UserAfterAuth,
    @Body() updateShowDto: UpdateShowDto,
  ) {
    const show = await this.showsService.updateShow({
      userId: user.id,
      showId,
      updateShowDto,
    });
    return show;
  }

  // 공연 삭제
  @UseGuards(AccessAuthGuard)
  @Delete(':showId')
  async removeShow(
    @Param('showId') showId: string,
    @User() user: UserAfterAuth,
  ): Promise<MessageResDto> {
    const show = await this.showsService.removeShow({
      showId,
      userId: user.id,
    });
    return show;
  }
}
