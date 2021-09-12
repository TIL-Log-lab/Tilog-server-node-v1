import { PickType } from '@nestjs/mapped-types';
import { Posts } from '../../entities/Posts';

class PostInfoDto extends PickType(Posts, ['id', 'usersId', 'categoryId', 'title', 'thumbNailUrl', 'viewCounts', 'likes', 'private', 'createdAt', 'updatedAt']) {}

/**
 * 포스트 리스트 DTO
 */
export class PostsListDto {
  postListData: PostInfoDto[];
  nextCursorNumber: number;
}
