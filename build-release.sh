if [ $1 = "stable" ];
then RELEASE_TYPE="stable"
elif [ $1 = "nightly" ];
then RELEASE_TYPE="nightly"
else
  echo "First parameter is expected 'stable' or 'nightly'"
  return 1
fi

echo "Preparing ${RELEASE_TYPE} release"

nvm i && . ./install-all.sh \
&& (cd packages/yoroi-extension; \
rm -f Yoroi.* && rm -f "Yoroi Nightly".*; \
npm run "prod:${RELEASE_TYPE}")
