import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { UserService } from '../../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: any, res: any, next: () => void) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      const user = await this.userService.findById(decoded.id);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}
