FROM nginx AS production-stage


RUN apt-get update && apt-get install -y npm
COPY . /code/
WORKDIR /code
RUN chmod 775 package.json

# For high-known problems with @sequelize/cli dependency:
RUN npm cache clean --force
RUN npm cache verify
RUN npm uninstall @sequelize/cli
RUN npm uninstall -g @sequelize/cli
RUN npm install


CMD node ./db/init.db.js; node ./core/api.js