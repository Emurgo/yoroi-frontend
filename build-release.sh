if [ $1 = "stable" ];
then RELEASE_TYPE="stable"
elif [ $1 = "stable-mv2" ];
then RELEASE_TYPE="stable-mv2"
elif [ $1 = "nightly" ];
then RELEASE_TYPE="nightly"
elif [ $1 = "nightly-mv2" ];
then RELEASE_TYPE="nightly-mv2"
else
  echo "First parameter is expected 'stable', 'stable-mv2', 'nightly', or 'nightly-mv2'"
  return 1
fi

echo "Preparing ${RELEASE_TYPE} release"

nvm i && . ./install-all.sh \
&& (cd packages/yoroi-extension; \
rm -f Yoroi.* && rm -f "Yoroi Nightly".*; \
npm run "prod:${RELEASE_TYPE}")
