if [ $1 = "stable" ];
then RELEASE_TYPE="prod:stable"
elif [ $1 = "stable-mv2" ];
then RELEASE_TYPE="prod:stable-mv2"
elif [ $1 = "nightly" ];
then RELEASE_TYPE="prod:nightly"
elif [ $1 = "nightly-mv2" ];
then RELEASE_TYPE="prod:nightly-mv2"
elif [ $1 = "test" ];
then RELEASE_TYPE="test:build"
else
  echo "First parameter is expected 'stable', 'stable-mv2', 'nightly', or 'nightly-mv2'"
  return 1
fi

echo "Preparing ${RELEASE_TYPE} release"

nvm i && . ./install-all.sh \
&& (cd packages/yoroi-extension; \
rm -f Yoroi.* && rm -f "Yoroi Nightly".* && rm -f Yoroi-test.crx; \
npm run "${RELEASE_TYPE}")
