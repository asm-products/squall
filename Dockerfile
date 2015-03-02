FROM google/nodejs

WORKDIR /usr/src/app
ADD package.json /usr/src/app/
RUN npm install
RUN npm install -g grunt-cli
ADD . /usr/src/app

EXPOSE 3000

CMD node bin/www

