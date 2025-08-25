import type { UsersRepository } from "@/app/repositories/users.repository";
import type { LoginDTO } from "./auth.dto";
import { NotFoundError } from "@/app/errors/not-found";
import { BadRequestError } from "@/app/errors/bad-request";
import { addDays } from "date-fns";
import type { User } from "@/app/entities/user.entity";
import { UnauthorizedError } from "@/app/errors/unauthorized";
import type { WebTokenService } from "@/app/services/web-token.service";
import type { HashService } from "@/app/services/hash.service";

export class AuthUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webTokenService: WebTokenService,
    private hashService: HashService
  ) {}

  async validate(token: string): Promise<User> {
    const payload = await this.webTokenService.decryptWebToken<{
      id: string;
    }>(token);

    if (!payload) throw new UnauthorizedError("Invalid authorization token");

    const user = await this.usersRepository.findById(payload.id);

    if (!user) throw new UnauthorizedError("User not found");

    return user;
  }

  async login(dto: LoginDTO) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) throw new NotFoundError("User not found");
    if (!user.hasPassword) throw new BadRequestError("Invalid password");

    if (!(await this.hashService.verifyHash(dto.password, user.password!)))
      throw new BadRequestError("Wrong password");

    const expiresAt = addDays(new Date(), 7);
    const token = await this.webTokenService.encryptWebToken({
      id: user.id.toValue(),
      exp: expiresAt.getTime(),
    });

    return { token, expiresAt };
  }
}
