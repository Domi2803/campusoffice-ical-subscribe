ARG BUILD_FROM
FROM $BUILD_FROM

COPY src/ /src
COPY run.sh /src
WORKDIR /src

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -

RUN \
    apt-get update \
    && apt-get install -y nodejs 

RUN npm i /src

CMD ["/src/run.sh"]