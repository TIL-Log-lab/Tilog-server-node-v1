import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Done } from '../dto/done.dto';
import { SessionInfo } from '../dto/session-info.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  // Stretegy 에서 반환된 유저 정보를 세션에 저장합니다.
  serializeUser(users: SessionInfo, done: Done) {
    Logger.log('serializeUser');
    done(null, users);
  }

  // 클라이언트에서 인증이 필요한 요청을 할 때,  요청받은 세션의 유저정보가 DB에 유저 정보를 확인 후 done으로 유저 정보를 반환해줍니다.
  async deserializeUser(users: SessionInfo, done: Done) {
    Logger.log('deserializeUser');
    const userDB = await this.usersService.findUser(users.oAuthServiceId);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
