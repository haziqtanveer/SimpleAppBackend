import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      name,
      password: hashedPassword,
    });

    var createdUser = await user.save();
    createdUser =  JSON.parse(JSON.stringify(createdUser));
    delete  createdUser.password
    return createdUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const response = await  this.userModel.findOne({ email })
    if(!response)
      {
        return null
      }
    return response;
  }
}
