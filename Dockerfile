# what type of env / what existing docker image to choose
FROM node:lts-alpine
# Set env variables
ENV DBUSER="alexabushanab"
ENV DBPASSWORD="54321"
ENV DBIP="18.215.68.159"
ENV DBPORT="5432"
ENV PORT="8080"
ENV LICENSEKEY="cc2a6c439637bc4dbec4327c3dc0f520b4f9NRAL"
ENV APPNAME="sdc"
ENV NODE_ENV=production
# the directory we are working from basically a way to cd into a directory
## WORKDIR /app
WORKDIR /usr/src/app

# copy package file into the directory
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# install deps
## RUN npm install --production --silent
RUN npm install --production --silent && mv node_modules ../
# copy source code (will ignore node_modules thanks to .dockerignore)
COPY . .

# make port available outside docker container
EXPOSE 8080
## RUN npm run build
RUN chown -R node /usr/src/app
# command to start application
USER node
CMD ["npm","start"]