#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

# Because npm link will write in this path
sudo chown -R "$(whoami):$(whoami)" /usr/local/lib/node_modules

export PATH=$HOME/.cargo/bin/:$PATH
if [ -z "$(which cargo)" ]
then
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> ${BASH_ENV}
fi

if [ -z "$(ls ~/.rustup/toolchains | grep ^${RUST_VERSION}-)" ]
then
  rustup install ${RUST_VERSION}
fi

for rust_target in ${RUST_TARGETS}
do
  if [ ! -e ~/.rustup/toolchains/${RUST_VERSION}*/lib/rustlib/manifest-rust-std-${rust_target} ]
  then
    rustup target add ${RUST_TARGETS} --toolchain ${RUST_VERSION}
  fi
done
