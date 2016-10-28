FROM node:6.9

MAINTAINER "Oscar Duque" <oduque@humboldt.org.co>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Mongo url
ENV MONGODB_URL localhost:27017/catalogoDb

EXPOSE 8000
CMD [ "npm", "start" ]
