import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('잘못된 사용자명 또는 비밀번호입니다.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: forgotPasswordDto.email } 
    });

    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 메시지를 반환
      return {
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다.',
      };
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1시간 후 만료

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepository.save(user);

    // TODO: 실제 이메일 발송 로직 구현
    // 현재는 콘솔에 토큰을 출력 (개발용)
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return {
      success: true,
      message: '비밀번호 재설정 이메일이 발송되었습니다.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { resetToken: resetPasswordDto.token }
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepository.save(user);

    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  async createInitialAdmin() {
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        isActive: true,
      });

      await this.userRepository.save(adminUser);
      console.log('Initial admin user created: admin / admin123');
    }
  }
} 