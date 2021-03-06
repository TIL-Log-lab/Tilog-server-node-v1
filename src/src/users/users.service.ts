import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionInfo } from 'src/auth/dto/session-info.dto';
import { UserInfo } from 'src/auth/dto/userinfo.dto';
import { Users } from 'src/entities/Users';
import { FaildGetUser, NotFoundUser, UserCreateFailed } from 'src/ExceptionFilters/Errors/Users/User.error';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepo: Repository<Users>) {}
  // 유저를 생성합니다.
  async createUser(userInfo: UserInfo): Promise<SessionInfo> {
    try {
      // DB에 유저를 생성합니다.
      const user = await this.userRepo.create(userInfo);
      return await this.userRepo.save(user);
    } catch (error) {
      // 에러 생성
      throw new UserCreateFailed(`service.user.createUser.${!!error.message ? error.message : 'Unknown_Error'}`);
    }
  }

  // 특정 유저를 검색합니다.
  async findUser(oAuthServiceId: string): Promise<Users | undefined> {
    return await this.userRepo.findOne({
      select: ['id', 'oAuthType', 'oAuthServiceId', 'proFileImageUrl', 'userName', 'mailAddress', 'createdAt', 'updatedAt', 'admin'],
      where: { oAuthServiceId },
    });
  }

  // 가입된 유저를 이름으로 검색합니다.
  async findUserToUserName(userName: string): Promise<Users | undefined> {
    try {
      const userInfo = await this.userRepo.findOne({
        select: ['id', 'oAuthType', 'oAuthServiceId', 'proFileImageUrl', 'userName', 'mailAddress', 'createdAt', 'updatedAt', 'admin'],
        where: { userName: userName },
      });
      // 유저가 존재하지 않는 경우
      if (!userInfo) throw new NotFoundUser(`service.users.findUserToUserName.Not found user`);
      return userInfo;
    } catch (error) {
      // 존재하지않는 유저
      if (error instanceof NotFoundUser) throw error;
      throw new FaildGetUser(`service.users.findUserToUserName.${!!error.message ? error.message : 'Unknown_Error'}`);
    }
  }
}
