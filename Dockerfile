FROM node:20-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache openssl

# 先复制依赖文件（利用 Docker 缓存层）
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# 复制全部代码
COPY . .

# 生成 Prisma Client 并构建生产包
RUN npx prisma generate && npm run build

EXPOSE 3000

# 启动时先执行数据库迁移，再启动服务
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
