FROM nginx:latest
COPY dist/  /usr/share/nginx/html/
MAINTAINER huangxiaohui<huangxiaohui@espressif.com>
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
COPY ./default.conf /etc/nginx/conf.d/
EXPOSE 80
