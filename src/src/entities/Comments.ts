import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Posts } from './Posts';
import { Users } from './Users';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

@Index('FK_comments_usersID_users_id', ['usersId'], {})
@Index('FK_comments_postsID_posts_id', ['postsId'], {})
@Entity('comments', { schema: 'tilog' })
// @Tree('closure-table')
export class Comments {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: '코멘트 아이디',
  })
  @ApiProperty({
    example: '1',
    description: '코멘트 아이디',
    type: String,
    required: true,
  })
  id: string;
  @IsInt()
  @IsNotEmpty()
  @Column('int', { name: 'usersID', comment: '유저 아이디', unsigned: true })
  @ApiProperty({
    example: '1',
    description: '유저 아이디',
    type: Number,
    required: true,
  })
  usersId: number;

  @IsString()
  @IsNotEmpty()
  @Column('bigint', { name: 'postsID', comment: '포스트 아이디' })
  @ApiProperty({
    example: '1',
    description: '포스트 아이디',
    type: String,
    required: true,
  })
  postsId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  @Column('varchar', { name: 'htmlContent', comment: '코멘트', length: 300 })
  @ApiProperty({
    example: '코멘트',
    description: '코멘트 내용',
    type: String,
    required: true,
  })
  htmlContent: string;

  @Column('bigint', {
    name: 'replyTo',
    nullable: true,
    comment: '답글 PK, 아닐경우 NULL',
  })
  @ApiProperty({
    example: '1',
    description: '부모 코멘트',
    type: String,
  })
  replyTo: string | null;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @Column('tinyint', {
    name: 'replyLevel',
    comment: '루트 코멘트 판별 0,1',
    default: () => "'0'",
  })
  @ApiProperty({
    example: '0',
    description: '루트 코멘트 판별',
    type: String,
    required: true,
  })
  replyLevel: number;

  @IsNotEmpty()
  @CreateDateColumn()
  @ApiProperty({
    example: '2022-11-01 17:10:54',
    description: '코멘트 작성일',
    type: String,
    required: true,
  })
  createdAt: String;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2022-11-01 17:10:54',
    description: '코멘트 수정일',
    type: String,
  })
  updatedAt: String | null;

  @DeleteDateColumn()
  @ApiProperty({
    example: '2022-11-01 17:10:54',
    description: '코멘트 삭제일',
    type: String,
  })
  deletedAt: String | null;

  @ManyToOne(() => Posts, (posts) => posts.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'postsID', referencedColumnName: 'id' }])
  posts: Posts;

  @ManyToOne(() => Users, (users) => users.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'usersID', referencedColumnName: 'id' }])
  users: Users;

  // @TreeParent()
  // parent: Comments;

  // @TreeChildren()
  // children: Comments[];
  // @ManyToOne(() => Comments, (comments) => comments.parentComment, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn([{ name: 'replyTo', referencedColumnName: 'id' }])
  // parentComment: Comments;

  // @OneToMany(() => Comments, (comments) => comments.parentComment, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // childComment: Comments[];
}
