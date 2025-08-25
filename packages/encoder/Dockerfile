FROM node:lts
WORKDIR /app

RUN apt-get update -y
RUN apt-get upgrade -y
# RUN apt-get install ffmpeg -y

COPY ./bin /app/bin
COPY . .
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start:prod" ]

# # use the official Bun image
# # see all versions at https://hub.docker.com/r/oven/bun/tags
# FROM oven/bun:debian AS base
# WORKDIR /usr/src/app

# # RUN useradd -ms /bin/bash bun
# # RUN chmod -R a+rw /usr/src/app
# RUN chown -R bun:bun /usr/src/app
# RUN chmod 755 /usr/src/app

# # install dependencies into temp directory
# # this will cache them and speed up future builds
# FROM base AS install
# RUN mkdir -p /temp/dev
# COPY package.json bun.lockb /temp/dev/
# RUN cd /temp/dev && bun install --frozen-lockfile

# # install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# # copy node_modules from temp directory
# # then copy all (non-ignored) project files into the image
# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# # [optional] tests & build
# # ENV NODE_ENV=production
# # RUN bun test
# # RUN bun run build

# # copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/src ./src
# COPY --from=prerelease /usr/src/app/package.json .
# COPY --from=prerelease /usr/src/app/bin ./bin
# COPY --from=prerelease /usr/src/app/bento4 ./bento4


# # RUN apt-get install libnvidia-decode-525-server

# # RUN git clone https://git.videolan.org/git/ffmpeg/nv-codec-headers.git /usr/nv-codec-headers
# # RUN cd nv-codec-headers && sudo make install && cd –
# # RUN git clone https://git.ffmpeg.org/ffmpeg.git /usr/src/app/ffmpeg
# # RUN apt-get install build-essential yasm cmake libtool libc6 libc6-dev unzip wget libnuma1 libnuma-dev
# # RUN /usr/src/app/ffmpeg/configure --enable-nonfree --enable-cuda-nvcc --enable-libnpp --extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib64 --disable-static --enable-shared --disable-x86asm
# # RUN cd /usr/src/app/ffmpeg && make -j 8
# # RUN cd /usr/src/app/ffmpeg && make install

# RUN apt -y update 
# RUN apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev -y
# RUN apt install python3 -y

# # RUN wget https://developer.download.nvidia.com/compute/cuda/12.6.3/local_installers/cuda-repo-debian12-12-6-local_12.6.3-560.35.05-1_amd64.deb && dpkg -i cuda-repo-debian12-12-6-local_12.6.3-560.35.05-1_amd64.deb && cp /var/cuda-repo-debian12-12-6-local/cuda-*-keyring.gpg /usr/share/keyrings/ && apt-get update && apt-get -y install cuda-toolkit-12-6 
# # RUN dpkg -i /usr/src/app/cuda-keyring_1.0-1_all.deb
# # RUN apt-get update
# # RUN apt-get -y install cuda
# # RUN export PATH=/usr/local/cuda-12.3/bin:$PATH
# # RUN export LD_LIBRARY_PATH=/usr/local/cuda-12.3/lib64:$LD_LIBRARY_PATH
# # RUN nvcc — version

#     # run the app
# USER bun
# # EXPOSE 3000/tcp
# ENTRYPOINT [ "bun", "run", "src/index.ts" ]

# # RUN apt-get update --fix-missing \
# #     && apt-get -y upgrade \
# #     && apt-get -y dist-upgrade


# # # Install dependencies
# # RUN apt-get -y install \
# #     cleancss \
# #     doxygen \
# #     debhelper-compat \
# #     flite1-dev \
# #     frei0r-plugins-dev \
# #     ladspa-sdk libaom-dev \
# #     libaribb24-dev \
# #     libass-dev \
# #     libbluray-dev \
# #     libbs2b-dev \
# #     libbz2-dev \
# #     libcaca-dev \
# #     libcdio-paranoia-dev \
# #     libchromaprint-dev \
# #     libcodec2-dev \
# #     libdc1394-22-dev \
# #     libdrm-dev \
# #     libfdk-aac-dev \
# #     libffmpeg-nvenc-dev \
# #     libfontconfig1-dev \
# #     libfreetype6-dev \
# #     libfribidi-dev \
# #     libgl1-mesa-dev \
# #     libgme-dev \
# #     libgnutls28-dev \
# #     libgsm1-dev \
# #     libiec61883-dev \
# #     libavc1394-dev \
# #     libjack-jackd2-dev \
# #     liblensfun-dev \
# #     liblilv-dev \
# #     liblzma-dev \
# #     libmp3lame-dev \
# #     libmysofa-dev \
# #     libnvidia-compute-470-server \
# #     libnvidia-decode-470-server \
# #     libnvidia-encode-470-server \
# #     libopenal-dev \
# #     libomxil-bellagio-dev \
# #     libopencore-amrnb-dev \
# #     libopencore-amrwb-dev \
# #     libopenjp2-7-dev \
# #     libopenmpt-dev \
# #     libopus-dev \
# #     libpulse-dev \
# #     librubberband-dev \
# #     librsvg2-dev \
# #     libsctp-dev \
# #     libsdl2-dev \
# #     libshine-dev \
# #     libsnappy-dev \
# #     libsoxr-dev \
# #     libspeex-dev \
# #     libssh-gcrypt-dev \
# #     libtesseract-dev \
# #     libtheora-dev \
# #     libtwolame-dev \
# #     libva-dev \
# #     libvdpau-dev \
# #     libvidstab-dev \
# #     libvo-amrwbenc-dev \
# #     libvorbis-dev \
# #     libvpx-dev \
# #     libwavpack-dev \
# #     libwebp-dev \
# #     libx264-dev \
# #     libx265-dev \
# #     libxcb-shape0-dev \
# #     libxcb-shm0-dev \
# #     libxcb-xfixes0-dev \
# #     libxml2-dev \
# #     libxv-dev \
# #     libxvidcore-dev \
# #     libxvmc-dev \
# #     libzmq3-dev \
# #     libzvbi-dev \
# #     nasm \
# #     node-less \
# #     ocl-icd-opencl-dev \
# #     pkg-config \
# #     texinfo \
# #     tree \
# #     wget \
# #     zlib1g-dev


# #     RUN wget -O ${HOME}/ffmpeg-${FFMPEG_VERSION}.tar.gz https://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.gz \
# #     && tar -xvf ${HOME}/ffmpeg-${FFMPEG_VERSION}.tar.gz \
# #     && cd ${HOME}/ffmpeg-${FFMPEG_VERSION} \
# #     && ./configure --prefix=/usr/local/ffmpeg-nvidia \
# #         --extra-cflags=-I/usr/local/cuda/include \
# #         --extra-ldflags=-L/usr/local/cuda/lib64 \
# #         --toolchain=hardened \
# #         --enable-gpl \
# #         --disable-stripping \
# #         --disable-filter=resample \
# #         --enable-cuvid \
# #         --enable-gnutls \
# #         --enable-ladspa \
# #         --enable-libaom \
# #         --enable-libass \
# #         --enable-libbluray \
# #         --enable-libbs2b \
# #         --enable-libcaca \
# #         --enable-libcdio \
# #         --enable-libcodec2 \
# #         --enable-libfdk-aac \
# #         --enable-libflite \
# #         --enable-libfontconfig \
# #         --enable-libfreetype \
# #         --enable-libfribidi \
# #         --enable-libgme \
# #         --enable-libgsm \
# #         --enable-libjack \
# #         --enable-libmp3lame \
# #         --enable-libmysofa \
# #         --enable-libnpp \
# #         --enable-libopenjpeg \
# #         --enable-libopenmpt \
# #         --enable-libopus \
# #         --enable-libpulse \
# #         --enable-librsvg \
# #         --enable-librubberband \
# #         --enable-libshine \
# #         --enable-libsnappy \
# #         --enable-libsoxr \
# #         --enable-libspeex \
# #         --enable-libssh \
# #         --enable-libtheora \
# #         --enable-libtwolame \
# #         --enable-libvorbis \
# #         --enable-libvidstab \
# #         --enable-libvpx \
# #         --enable-libwebp \
# #         --enable-libx265 \
# #         --enable-libxml2 \
# #         --enable-libxvid \
# #         --enable-libzmq \
# #         --enable-libzvbi \
# #         --enable-lv2 \
# #         --enable-nvenc \
# #         --enable-nonfree \
# #         --enable-omx \
# #         --enable-openal \
# #         --enable-opencl \
# #         --enable-opengl \
# #         --enable-sdl2 \
# #     && make -j 8

# # RUN cd ${HOME}/ffmpeg-${FFMPEG_VERSION} \
# #     && make install

# # RUN cd ${HOME} \
# #     && rm -rvf ${HOME}/ffmpeg-${FFMPEG_VERSION}.tar.gz ${HOME}/ffmpeg-${FFMPEG_VERSION}

# # RUN echo 'PATH="/usr/local/ffmpeg-nvidia/bin:$PATH"' >> ${HOME}/.bashrc
