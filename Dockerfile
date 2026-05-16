FROM node:20-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache openssl

# 安装 pnpm 并设置国内镜像（加速下载）
RUN npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

# 先复制依赖文件（利用 Docker 缓存层）
COPY package*.json ./
COPY prisma ./prisma/

RUN pnpm install

# 复制全部代码
COPY . .

# 生成 Prisma Client 并构建生产包
RUN pnpm prisma generate && pnpm build

EXPOSE 3000

# 启动时先执行数据库迁移，再启动服务
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
