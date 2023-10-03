import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import {
  IShowsServiceCreateShow,
  IShowsServiceDeleteShow,
  IShowsServiceFindByShowId,
  IShowsServiceFindMyShow,
  IShowsServiceFindOneShow,
  IShowsServiceFindShow,
  IShowsServiceUpdateShow,
} from './interfaces/shows-service.interface';
import { Show } from './entities/show.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { MessageResDto } from 'src/commons/dto/message-res.dto';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showsRepository: Repository<Show>,
    private readonly usersService: UsersService,
  ) {}

  // 공연 검색
  async searchShow({ keyword }: SearchReqDto): Promise<Show[]> {
    const shows = await this.showsRepository
      .createQueryBuilder('show')
      .select([
        'show.title',
        'show.description',
        'show.showTime',
        'show.maxSeats',
      ])
      .where(
        'show.title LIKE :keyword OR show.description LIKE :keyword OR show.showTime LIKE :keyword OR show.maxSeats LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .getMany();

    if (shows.length === 0) {
      throw new NotFoundException('검색 결과가 존재하지 않습니다.');
    }

    return shows;
  }

  // // 공연 검색
  // async searchShow({ searchReqDto }: IShowsServiceSearchShow): Promise<Show[]> {
  //   const { page, size, keyword } = searchReqDto;
  //   const shows = await this.showsRepository.find({
  //     where: [
  //       { title: Like(`%${keyword}%`) },
  //       { description: Like(`%${keyword}%`) },
  //     ],
  //     order: { createdAt: 'DESC' },
  //     take: size,
  //     skip: (page - 1) * size,
  //   });

  //   return shows;
  // }

  // 공연 생성
  async createShow({
    createShowDto,
    userId,
  }: IShowsServiceCreateShow): Promise<Show> {
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException();

    return await this.showsRepository.save({
      user: { id: userId },
      ...createShowDto,
    });
  }

  // 내가 생성한 공연 조회
  async findAllMyShow({
    userId,
    pageReqDto,
  }: IShowsServiceFindMyShow): Promise<[Show[], number]> {
    const { page, size } = pageReqDto;

    const shows = await this.showsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
      where: { user: { id: userId } },
    });

    if (!shows) new NotFoundException();

    return shows;
  }

  // 공연 조회
  async findAllShow({
    pageReqDto,
  }: IShowsServiceFindShow): Promise<[Show[], number]> {
    const { page, size } = pageReqDto;

    const shows = await this.showsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });

    if (!shows) new NotFoundException();

    return shows;
  }

  // 공연 상세 조회
  async findOneShow({ showId }: IShowsServiceFindOneShow): Promise<Show> {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    return show;
  }

  // 공연 수정
  async updateShow({ userId, updateShowDto, showId }: IShowsServiceUpdateShow) {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    if (show.user.id !== userId)
      throw new ForbiddenException('공연을 수정할 권한이 없습니다.');

    const result = await this.showsRepository.save({
      ...updateShowDto,
    });

    return result;
  }

  // 공연 삭제
  async removeShow({
    showId,
    userId,
  }: IShowsServiceDeleteShow): Promise<MessageResDto> {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    if (show.user.id !== userId)
      throw new ForbiddenException('공연을 삭제할 권한이 없습니다');

    await this.showsRepository.remove(show);
    return { message: '공연이 삭제되었습니다.' };
  }

  // 공연 아이디 찾기
  async findByShowId({ showId }: IShowsServiceFindByShowId): Promise<Show> {
    return await this.showsRepository.findOne({
      where: { id: showId },
      relations: ['user'],
    });
  }
}
