FROM circleci/node:8-browsers AS rust-env-setup
COPY --from=emurgo/yoroi-frontend-src:latest /src /src
WORKDIR /src

# this copy invalidates build cache in case setup function changed
COPY ./docker-assets/bin/rust-setup.functions /src/docker-assets/bin/rust-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/rust-setup.functions && \
    rust-setup'

FROM rust-env-setup AS yoroi

# this copy invalidates build cache in case setup function changed
COPY ./docker-assets/bin/yoroi-setup.functions /src/docker-assets/bin/yoroi-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/yoroi-setup.functions && \
    yoroi-depends-install'

RUN /bin/bash -c 'source docker-assets/bin/yoroi-setup.functions && \
    yoroi-build'

COPY ./docker-assets/bin/entrypoint* /src/docker-assets/bin/
RUN /bin/bash -c 'source docker-assets/bin/entrypoint.functions && \
    setup-sudoers && \
    sudo chmod +x /src/docker-assets/bin/entrypoint'
ENTRYPOINT ["/src/docker-assets/bin/entrypoint"]

FROM ubuntu:18.04 AS yoroi-standalone-chrome-mainnet
COPY --from=yoroi /src/build /yoroi
ARG DATE=20190327
RUN apt update -qq && \
    apt install -y sudo curl rsync && \
    curl -o /var/cache/apt/archives/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y /var/cache/apt/archives/chrome.deb && \
    apt clean 
COPY ./docker-assets/bin/entrypoint* /src/docker-assets/bin/
ENTRYPOINT ["/src/docker-assets/bin/entrypoint", "run-chrome"]
