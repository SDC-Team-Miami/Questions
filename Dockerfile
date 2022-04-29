# what type of env / what existing docker image to choose
FROM node:16
# the directory we are working from basically a way to cd into a directory
WORKDIR /app
# copy package file into the directory
COPY package*.json ./
# install deps
RUN npm install --production --silent
# copy source code (will ignore node_modules thanks to .dockerignore)
COPY . .
# Set env variables
ENV DB="postgres://alexabushanab:54321@localhost:5432/questiondb"
ENV DBUSER="alexabushanab"
ENV DBPASSWORD="54321"
ENV DBIP="18.215.68.159"
ENV DBPORT="5432"
ENV PORT="8080"
ENV LICENSEKEY="cc2a6c439637bc4dbec4327c3dc0f520b4f9NRAL"
ENV APPNAME="sdc"
ENV NODE_ENV=production
# make port available outside docker container
EXPOSE 4000
RUN npm run build
# command to start application
CMD ["npm","start"]