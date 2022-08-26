FROM node:lts-alpine

RUN mkdir -p /var/atj

ADD ./ /var/atj
WORKDIR /var/atj

RUN apk add python3 make g++ openjdk8-jre chromium grep

ENV PATH $PATH:/var/atj/node_modules

RUN npm install

CMD ["/bin/sh"]

