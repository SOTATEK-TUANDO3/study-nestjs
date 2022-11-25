import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
    // this.usersService.createUser(createUserDto);
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
