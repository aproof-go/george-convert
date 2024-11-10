# 使用 Ubuntu 基础镜像
FROM ubuntu:22.04

# 设置非交互式安装
ENV DEBIAN_FRONTEND=noninteractive

# 安装基础依赖
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    gnupg \
    python3 \
    libegl1 \
    libfontconfig1 \
    libgl1 \
    xdg-utils \
    xz-utils \
    libopengl0 \
    libglu1-mesa \
    libxcb-cursor0 \
    libxcb-xinerama0 \
    libxcb-xfixes0 \
    libxkbcommon-x11-0 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-randr0 \
    libxcb-render-util0 \
    libxcb-shape0 \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 安装 Calibre
RUN wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin

# 设置工作目录
WORKDIR /app

# 使用淘宝 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建上传和转换目录
RUN mkdir -p uploads converted && \
    chmod 777 uploads converted

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "run", "dev"]
