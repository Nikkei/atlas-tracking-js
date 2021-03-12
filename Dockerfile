FROM node:15.11.0-alpine

RUN mkdir -p /var/atj

ADD ./ /var/atj
WORKDIR /var/atj

RUN apk add python make g++ openjdk8-jre chromium grep

ENV PATH $PATH:/var/atj/node_modules

RUN npm install

CMD ["/bin/sh"]

