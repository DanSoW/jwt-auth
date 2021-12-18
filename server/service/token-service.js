const jwt = require('jsonwebtoken');
const {
    Tokens
} = require('../sequelize/database');

class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15s'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30s'});

        return {
            accessToken,
            refreshToken
        };
    }

    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        }catch(e){
            return null;
        }
    }

    validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        }catch(e){
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await Tokens.findOne({
            where: {
                user_id: userId,
            }
        });

        if(tokenData){
            tokenData.refresh_token = refreshToken;
            return await tokenData.save();
        }

        const token = await Tokens.create({
            user_id: userId,
            refresh_token: refreshToken
        });

        return token;
    }

    async removeToken(refreshToken){
        const tokenData = await Tokens.destroy({
            where: {
                refresh_token: refreshToken
            }
        });

        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = await Tokens.findOne({
            where: {
                refresh_token: refreshToken
            }
        });

        return tokenData;
    }
}

module.exports = new TokenService();