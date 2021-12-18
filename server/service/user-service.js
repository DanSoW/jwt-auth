const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

const {
    Users
} = require('../sequelize/database');

class UserService{
    // Регистрация пользователя
    async registration(email, password){
        const candidate = await Users.findOne({
            where: {
                email: email
            }
        });

        if(candidate){
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        const user = await Users.create({
            email: email,
            password: hashPassword,
            activation_link: activationLink
        });

        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink){
        const user = await Users.findOne({
            where:{
                activation_link: activationLink
            }
        });

        if(!user){
            throw ApiError.BadRequest("Некорректная ссылка активации");
        }

        user.is_activated = true;
        await user.save();
    }

    async login(email, password){
        const user = await Users.findOne({
            where: {
                email: email
            }
        });

        if(!user){
            throw ApiError.BadRequest('Пользователь с таким почтовым адресом не был найден');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
    
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto};
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);

        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnathorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.findToken(refreshToken);

        if((!userData) || (!tokenFromDB)){
            throw ApiError.UnathorizedError();
        }

        const user = await Users.findOne({
            where: {
                id: userData.id
            }
        });

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
    
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto};
    }

    async getAllUsers(){
        const users = await Users.findAll();
        return users;
    }
}

module.exports = new UserService();