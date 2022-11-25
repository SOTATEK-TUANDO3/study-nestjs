import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createUsers(users: User[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(users[0]);
      await queryRunner.manager.save(users[1]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    console.log(password);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    try {
      const user = this.UserRepository.create({
        username,
        password: hashedPassword,
      });
      this.UserRepository.save(user);
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exits');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  findAll(): Promise<User[]> {
    return this.UserRepository.find();
  }

  findOneByUsername(username: string): Promise<User> {
    return this.UserRepository.findOneBy({ username });
  }

  async remove(id: string): Promise<void> {
    await this.UserRepository.delete(id);
  }
}
