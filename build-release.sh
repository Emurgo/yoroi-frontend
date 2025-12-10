if [ $1 = "stable" ];
then RELEASE_TYPE="prod:stable"
elif [ $1 = "stable-ff" ];
then RELEASE_TYPE="prod:stable-ff"
elif [ $1 = "nightly" ];
then RELEASE_TYPE="prod:nightly"
elif [ $1 = "test" ];
then RELEASE_TYPE="test:build"
else
  echo "First parameter is expected 'stable', 'stable-ff' or 'nightly'"
  return 1
fi

echo "Preparing ${RELEASE_TYPE} release"

nvm i && . ./install-all.sh \
&& (cd packages/yoroi-extension; \
rm -f Yoroi.* && rm -f "Yoroi Nightly".* && rm -f Yoroi-test.crx; \
npm run "${RELEASE_TYPE}")
