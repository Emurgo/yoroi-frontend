// sets up RPC communication with the connector + access check/request functions
const WALLET_NAME = 'yoroi';
const API_VERSION = '0.3.0';
const YOROI_TYPE = '$YOROI_BUILD_TYPE_ENV$';
const INJECTED_TYPE_TAG_ID = '__yoroi_connector_api_injected_type'
// base64 encoding of packages/yoroi-extension/app/assets/images/yoroi-logo-shape-blue.inline.svg
const ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjE1LjM5IDE4Ny4yMiI+PGRlZnM+PHN0eWxlPi5jbHMtMSwuY2xzLTJ7ZmlsbDpub25lO30uY2xzLTF7Y2xpcC1ydWxlOmV2ZW5vZGQ7fS5jbHMtM3tjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgpO30uY2xzLTR7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTIpO30uY2xzLTV7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTMpO30uY2xzLTZ7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTQpO30uY2xzLTd7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTUpO30uY2xzLTh7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTYpO30uY2xzLTl7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTcpO30uY2xzLTEwe2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aC04KTt9LmNscy0xMXtjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtOSk7fS5jbHMtMTJ7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTEwKTt9LmNscy0xM3tjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtMTEpO30uY2xzLTE0e2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aC0xMik7fS5jbHMtMTV7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTEzKTt9LmNscy0xNntjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtMTQpO30uY2xzLTE3e2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aC0xNSk7fS5jbHMtMTh7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTE2KTt9LmNscy0xOXtjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtMTcpO30uY2xzLTIwe2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aC0xOCk7fS5jbHMtMjF7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTE5KTt9LmNscy0yMntjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtMjApO30uY2xzLTIze2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aC0yMSk7fS5jbHMtMjR7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTIyKTt9LmNscy0yNXtmaWxsOnVybCgjbGluZWFyLWdyYWRpZW50KTt9PC9zdHlsZT48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aCI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLTY2OS4zOC0zMjAzLjlsLTIuNDksMzEuMi0yLjM3LDI5LjY5LTIuNDMsMzAuNDVhMi45MywyLjkzLDAsMCwwLC4yMSwxLjkxYzE0Ny4xLDEyNi43NCwyOTMuMTMsMjUzLjQsNDM5Ljg4LDM4MC4xMWw2Ny4xMy00MS41NUMtMzM2LjIyLTI5MTUuOTEtNTAyLjMxLTMwNTkuMy02NjkuMzgtMzIwMy45WiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtMiI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLTI4MC4zMi0zMjM1Yy0yOC4yOSwyMS4zLTU2LjU3LDQxLjgzLTg0Ljg2LDYzLjEzLTMuODksMi43MS02LjM2LDMuMS0xMC4yNSwwLTM0LjY1LTI2LjMzLTY5LjY1LTUyLjY3LTEwNC42NS03OS0zNi40Mi0yOC4yNy03Mi44NC01Ni41NC0xMDkuNjEtODQuNDJsLTUyLTM5LjUxSC03NjcuNTNjNi43Miw1LDEyLDkuMywxNy42OCwxMy41NiwzMi44OCwyNC43OCw2NS43Niw1MCw5OC42NCw3NC43NGw5Ny41OSw3NC4zNmMzMC40LDIzLjI0LDYxLjE2LDQ2Ljg3LDkxLjU3LDcwLjEsMjksMjIuMDgsNTguMzQsNDMuNzcsODcuMzMsNjYuMjMsMy4xOCwyLjMyLDUuMywyLjMyLDguNDgsMCwyMy4zNC0xNy44MSw0Ny0zNC44Niw3MC43MS01Mi42N3E4Ny02NS42NCwxNzQtMTMwLjkxYzQyLjA3LTMxLjc1LDg0LjUtNjMuNTEsMTI2LjU3LTk0Ljg4LDguODQtNi41OSwxNy4zMi0xMy4xNywyNi41Mi0yMC4xNEgtOTQuN0MtMTU2LjU4LTMzMjguMy0yMTguMS0zMjgxLjQ0LTI4MC4zMi0zMjM1WiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtMyI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLTY4Ni45Mi0yOTY0LjY5YTE5LjU5LDE5LjU5LDAsMCwwLS43LDEuOTF2OTEuMzljMCwuNzYuMzUsMS4xNS4zNSwxLjkxLDEwMi44OCw3Ny42MiwyMDUuNzUsMTU0Ljg2LDMwOS4zMywyMzIuODZoLjM1bDYyLjg1LTQ4LjE4Qy00MzkuMzgtMjc3OC40OC01NjMtMjg3MS4zOS02ODYuOTItMjk2NC42OVoiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTQiPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTS00OC43NS0zMTgzLjRjLTgwLjQsNTcuMzEtMTU5LjY5LDExNC4yNi0yMzkuMzUsMTcxLjJhMjQuMTcsMjQuMTcsMCwwLDAsMi41NiwzYzIwLjA5LDE0LjcxLDQwLjU2LDI5LjQyLDYwLjY2LDQ0LjEyLjM2LjM4LDEuNDYuMzgsMi4xOS4zOCw1Ny43My00MS4xLDExNS40Ny04Mi41OCwxNzMuNTctMTIzLjY5LjM3LS4zNy4zNy0xLjEzLjczLTEuNXYtOTMuNTJaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC01Ij48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0tNDguMzktMjk2NC42OWMtMjcsMjAuNTEtNTMuMjcsNDAuNjEtNzkuOSw2MC43MSwyMS4xNiwxNi40OCw0MS41OSwzMi41Nyw2Miw0OC42NUwtNDguMzktMjg2OVoiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTYiPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSI1NzAuMTggLTMzNDEuOTcgNTk2LjAxIC0zMzQxLjk3IDQ0NC4yMyAtMzA5Ny4xNiA0NDQuMjMgLTI4OTMuOTQgNDIyLjY1IC0yODkzLjk0IDQyMi42NSAtMzA5Ny4xNiAyNzEuNTggLTMzNDEuOTcgMjk3LjQxIC0zMzQxLjk3IDQzMi41NiAtMzEyMS42IDQzMy42MiAtMzEyMS42IDU3MC4xOCAtMzM0MS45NyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtNyI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNODMyLjctMjkxMy4yOGM1My40MiwwLDk4LjcxLTE5LDEzNS4xNS01Ny4yOFExMDIzLTMwMjgsMTAyMy0zMTE4LjMyYzAtNjAuMi0xOC40LTEwOS4wOS01NS4xOS0xNDctMzYuNDQtMzguMzEtODEuMzgtNTYuOTItMTM1LjE1LTU2LjkyLTU2LjI1LDAtMTAyLjYsMTkuNzEtMTM4LjMzLDU4Ljc0cy01My43OCw4Ny41Ny01My43OCwxNDUuMjEsMTgsMTA2LjE3LDUzLjc4LDE0NS45NEM3MzAuNDUtMjkzMy4zNSw3NzYuNDUtMjkxMy4yOCw4MzIuNy0yOTEzLjI4Wm0tLjM2LDIxLjg5cS05NC40NiwwLTE1NC4yNS02NS4zMS02MC02NS4xMi02MC4xNC0xNjJjMC02My44NSwxOS44MS0xMTcuODUsNjAuMTQtMTYxLjI2cTYwLTY1LjEzLDE1NC4yNS02NS4zMSw5MC43NSwwLDE1MS43OCw2My40OHQ2MS4yMSwxNjMuMDljMCw2Ni43Ni0yMC41MiwxMjEuNDktNjEuMjEsMTYzLjgxUTkyMi41Ni0yODkxLjM5LDgzMi4zNC0yODkxLjM5WiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtOCI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTE1Ny44My0zMzE5LjcxdjIxNmgxMTMuMjJxMTIzLjY1LDAsMTIzLjQ3LTEwOS44MWMwLTM1LjM5LTkuOS02Mi0yOS43Mi03OS41NHMtNDcuNDEtMjYuNjMtODIuNzktMjYuNjNabTI2NSw0MjUuNzdoLTI2Ljg5bC0xMzAuMi0xODguMjZIMTE1OC4xOXYxODguMjZoLTIxLjk0di00NDhIMTI4MC42YzQ1LjY0LDAsODAsMTEuNjgsMTAyLjYsMzVzMzQsNTQuNzIsMzQsOTMuNzZjMCw0MS4yMy0xMS4zMiw3Mi42LTM0LDk0LjUtMjIuNjQsMjEuNTItNTIuMzYsMzMuOTMtODkuNTEsMzYuMTFsLS43MSwxLjgzWiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtOSI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTY5Ni4zMS0yOTEzLjI4YzUzLjQyLDAsOTguNy0xOSwxMzUuMTUtNTcuMjhxNTUuMTgtNTcuNDYsNTUuMTktMTQ3Ljc2YzAtNjAuMi0xOC40LTEwOS4wOS01NS4xOS0xNDctMzYuNDUtMzguMzEtODEuMzgtNTYuOTItMTM1LjE1LTU2LjkyLTU2LjI2LDAtMTAyLjYsMTkuNzEtMTM4LjM0LDU4Ljc0LTM2LjA4LDM5LTUzLjc3LDg3LjU3LTUzLjc3LDE0NS4yMXMxOCwxMDYuMTcsNTMuNzcsMTQ1Ljk0QzE1OTQuMDYtMjkzMy4zNSwxNjQwLjA1LTI5MTMuMjgsMTY5Ni4zMS0yOTEzLjI4Wm0tLjM2LDIxLjg5cS05NC40NiwwLTE1NC4yNS02NS4zMS02MC02NS4xMi02MC4xNC0xNjJjMC02My44NSwxOS44MS0xMTcuODUsNjAuMTQtMTYxLjI2cTYwLTY1LjEzLDE1NC4yNS02NS4zMSw5MC43NSwwLDE1MS43OCw2My40OHQ2MS4yMSwxNjMuMDljMCw2Ni43Ni0yMC41MiwxMjEuNDktNjEuMjEsMTYzLjgxUTE3ODYuMTctMjg5MS4zOSwxNjk2LTI4OTEuMzlaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0xMCI+PHJlY3QgY2xhc3M9ImNscy0yIiB4PSIyMDAzLjc1IiB5PSItMzM0MS45NyIgd2lkdGg9IjIxLjU4IiBoZWlnaHQ9IjQ0OC4wMiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgtMTEiPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSI5OTkuMjUgLTI2OTEuNzQgMTAwNi45NCAtMjY5MS43NCA5NjkuODYgLTI1ODcuMDkgOTYyLjE2IC0yNTg3LjA5IDkzMi4wNyAtMjY3OS41NyA5MzEuNzIgLTI2NzkuNTcgOTAxLjk4IC0yNTg3LjA5IDg5NC4yOCAtMjU4Ny4wOSA4NTcuMTkgLTI2OTEuNzQgODY1LjI0IC0yNjkxLjc0IDg5Ny43OCAtMjU5OC45MSA5MjcuNTIgLTI2OTEuNzQgOTM1LjkyIC0yNjkxLjc0IDk2Ni4wMSAtMjU5OS4yNiA5OTkuMjUgLTI2OTEuNzQiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTEyIj48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0xMDc5LjcyLTI1OTMuNjljMTIuMjQsMCwyMi4zOS00LjE4LDMwLjQ0LTEyLjE3LDgtOC4zNSwxMi4yNC0xOS4xMywxMi4yNC0zMi42OHEwLTE5LjgzLTExLjU0LTMzLjM4Yy03LjctOS0xOC4yLTEzLjU2LTMwLjc5LTEzLjU2YTQzLjQ3LDQzLjQ3LDAsMCwwLTMxLjg0LDEzLjIxYy04Ljc1LDguNjktMTMsMjAuMTctMTMsMzQuMDcsMCwxMi44Nyw0LjIsMjMuNjQsMTIuNiwzMkMxMDU1LjkzLTI1OTcuODcsMTA2Ni43Ny0yNTkzLjY5LDEwNzkuNzItMjU5My42OVptNDIuNjgtOThoNy4zNXYxMDQuNjVoLTcuMzV2LTIzLjI5aC0uMzVjLTkuMDksMTYtMjMuNDQsMjQtNDIuMzMsMjQtMTQuNywwLTI2Ljk0LTQuODctMzcuMDktMTQuMjZzLTE1LTIyLjI1LTE1LTM3Ljg5LDQuODktMjguNTEsMTQuNjktMzguNmM5LjgtMTAuNDMsMjIuMzktMTUuMjksMzcuNzktMTUuMjlhNDUuNDEsNDUuNDEsMCwwLDEsMjQuNDksNi42LDQ4LjM0LDQ4LjM0LDAsMCwxLDE3LjQ5LDE4LjA4aC4zNVoiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTEzIj48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjExNzQuNTMiIHk9Ii0yNzQ1Ljk3IiB3aWR0aD0iNy4zNCIgaGVpZ2h0PSIxNTguNTQiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTE0Ij48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjEyMjkuMTIiIHk9Ii0yNzQ1Ljk3IiB3aWR0aD0iNy4zNCIgaGVpZ2h0PSIxNTguNTQiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTE1Ij48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0xMzI1LjMzLTI2ODUuNDhBMzkuODEsMzkuODEsMCwwLDAsMTI5Ny0yNjc0Yy04LDcuNjUtMTIuNTksMTcuMzktMTMuMjksMjkuNTZoODAuNDdjLS43LTEyLjUyLTQuNTUtMjIuMjYtMTEuNTQtMjkuOUMxMzQ1LjI4LTI2ODIsMTMzNi4xOC0yNjg1LjQ4LDEzMjUuMzMtMjY4NS40OFptNDUuODQsNDMuNDZjMCwyLjQzLDAsMy44Mi0uMzUsNC41MkgxMjgzYy43LDEyLjUxLDQuOSwyMy4yOSwxMi41OSwzMS42NCw4LjA1LDguMzQsMTcuODUsMTIuNTEsMjkuNzQsMTIuNTEsMTQuNywwLDI2LjYtNS41NiwzNS42OS0xN2w1LjYsNC44NmMtMTAuMTUsMTIuODctMjMuNDQsMTkuNDctNDAuNTksMTkuNDctMTQuNjksMC0yNi41OS00Ljg2LTM2LjM4LTE0LjYtOS40NS05LjczLTE0LjM1LTIyLjYtMTQuMzUtMzguMjRzNC41NS0yOC4xNiwxNC0zOC4yNSwyMS0xNSwzNC42My0xNWMxNC4zNSwwLDI1LjU1LDQuODcsMzMuOTQsMTQuMjZDMTM2Ny0yNjY5LjE0LDEzNzEuMTctMjY1NywxMzcxLjE3LTI2NDJaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0xNiI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTQzNS45LTI1ODYuMzljLTkuMSwwLTE1Ljc1LTIuNDQtMTkuMjUtNy4zcy01LjI1LTEyLjE3LTUuMjUtMjEuOTF2LTY5LjE4aC0xNC42OXYtN2gxNC42OXYtMzcuMmw3LS42OXYzOC4yNGg0MC45NHY2Ljk1SDE0MTguNHY2Ni4wNmMwLDguNjksMSwxNSwzLjUsMTkuMTJzNyw2LjI2LDEzLjY1LDYuMjZhMzYuODMsMzYuODMsMCwwLDAsMjEuMzQtNi42MWwyLjEsN0E0Ny44NSw0Ny44NSwwLDAsMSwxNDM1LjktMjU4Ni4zOVoiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTE3Ij48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iNzQ5Ljk5IC02MzguOTcgNzUyLjA2IC02MzguOTcgNzQyLjA5IC02MTAuODUgNzQwLjAyIC02MTAuODUgNzMxLjkzIC02MzUuNyA3MzEuODQgLTYzNS43IDcyMy44NSAtNjEwLjg1IDcyMS43OCAtNjEwLjg1IDcxMS44MSAtNjM4Ljk3IDcxMy45NyAtNjM4Ljk3IDcyMi43MiAtNjE0LjAyIDczMC43MSAtNjM4Ljk3IDczMi45NyAtNjM4Ljk3IDc0MS4wNSAtNjE0LjEyIDc0OS45OSAtNjM4Ljk3Ii8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0xOCI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNzcxLjYxLTYxMi42MmExMS4xNiwxMS4xNiwwLDAsMCw4LjE4LTMuMjcsMTIuMSwxMi4xLDAsMCwwLDMuMy04Ljc5LDEzLjM2LDEzLjM2LDAsMCwwLTMuMTEtOSwxMC40LDEwLjQsMCwwLDAtOC4yNy0zLjY0LDExLjY2LDExLjY2LDAsMCwwLTguNTYsMy41NSwxMi4zNywxMi4zNywwLDAsMC0zLjQ4LDkuMTYsMTEuNjQsMTEuNjQsMCwwLDAsMy4zOSw4LjU5QTExLjQsMTEuNCwwLDAsMCw3NzEuNjEtNjEyLjYyWk03ODMuMDktNjM5aDJ2MjguMTJoLTJ2LTYuMjZINzgzYTEyLjI2LDEyLjI2LDAsMCwxLTExLjM4LDYuNDUsMTQuMTEsMTQuMTEsMCwwLDEtMTAtMy44M2MtMi43My0yLjUyLTQtNi00LTEwLjE5QTE0LjI4LDE0LjI4LDAsMCwxLDc2MS41NS02MzVhMTMuMjYsMTMuMjYsMCwwLDEsMTAuMTYtNC4xMSwxMi4xNSwxMi4xNSwwLDAsMSw2LjU4LDEuNzgsMTMsMTMsMCwwLDEsNC43LDQuODZoLjFaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0xOSI+PHJlY3QgY2xhc3M9ImNscy0yIiB4PSI3OTcuMSIgeT0iLTY1My41NSIgd2lkdGg9IjEuOTciIGhlaWdodD0iNDIuNjEiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTIwIj48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjgxMS43NiIgeT0iLTY1My41NSIgd2lkdGg9IjEuOTciIGhlaWdodD0iNDIuNjEiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTIxIj48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik04MzcuNjItNjM3LjI5YTEwLjcxLDEwLjcxLDAsMCwwLTcuNjEsMy4wOCwxMS40MSwxMS40MSwwLDAsMC0zLjU4LDhoMjEuNjNhMTIuNDQsMTIuNDQsMCwwLDAtMy4xLThBOS42OCw5LjY4LDAsMCwwLDgzNy42Mi02MzcuMjlabTEyLjMyLDExLjY4YTMuNjQsMy42NCwwLDAsMS0uMDksMS4yMUg4MjYuMjRhMTMuMzQsMTMuMzQsMCwwLDAsMy4zOSw4LjUxLDEwLjYyLDEwLjYyLDAsMCwwLDgsMy4zNiwxMS41OSwxMS41OSwwLDAsMCw5LjU5LTQuNThsMS41MSwxLjMxYTEzLjE0LDEzLjE0LDAsMCwxLTEwLjkxLDUuMjMsMTMuMjQsMTMuMjQsMCwwLDEtOS43OC0zLjkyLDE0LjIzLDE0LjIzLDAsMCwxLTMuODUtMTAuMjhBMTQuMzEsMTQuMzEsMCwwLDEsODI3Ljk0LTYzNWExMi4yMywxMi4yMywwLDAsMSw5LjMxLTQsMTEuNjEsMTEuNjEsMCwwLDEsOS4xMiwzLjg0Qzg0OC44MS02MzIuOSw4NDkuOTQtNjI5LjYzLDg0OS45NC02MjUuNjFaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0yMiI+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNODY3LjM0LTYxMC42NmMtMi40NSwwLTQuMjQtLjY2LTUuMTgtMmExMC4wOSwxMC4wOSwwLDAsMS0xLjQxLTUuODlWLTYzNy4xaC00Vi02MzloNHYtMTBsMS44OC0uMTl2MTAuMjhoMTFWLTYzN2gtMTF2MTcuNzVhMTAuNTEsMTAuNTEsMCwwLDAsLjk0LDUuMTRjLjY2LDEuMTIsMS44OCwxLjY4LDMuNjcsMS42OGE5Ljk0LDkuOTQsMCwwLDAsNS43NC0xLjc3bC41NiwxLjg3QTEyLjkyLDEyLjkyLDAsMCwxLDg2Ny4zNC02MTAuNjZaIi8+PC9jbGlwUGF0aD48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCIgeDE9IjI3LjM5IiB5MT0iMTMyLjkiIHgyPSIxODcuODQiIHkyPSItMjcuNTUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxYTQ0YjciLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+eW9yb2kgbG9nbzwvdGl0bGU+PGcgaWQ9InRpY2siPjxwYXRoIGNsYXNzPSJjbHMtMjUiIGQ9Ik0xNjYuNDEsMTQ2LjQ2bC0xNy4wNywxMS44NUwyMy42NCw3MS40NWMwLS4xNywwLS4zNC0uMDUtLjUxVjYzLjE5cTAtMy43NywwLTcuNTNWNDcuNzdaTTEzMS4zMywzNC4zNmMtNy41OSw1LjItMTUuMjUsMTAuMy0yMi44NCwxNS41YTIuMDUsMi4wNSwwLDAsMS0yLjc2LDBjLTkuMzgtNi41My0xOC44MS0xMy0yOC4yLTE5LjQ4UTYyLjcxLDIwLjA5LDQ3LjkxLDkuNzRMMzMuOSwwSDBDMS44LDEuMjYsMy4yOCwyLjMyLDQuNzcsMy4zNUwzMS4zNCwyMS43N3ExMy4xNCw5LjE0LDI2LjI3LDE4LjI4YzguMjQsNS43MywxNi40NiwxMS40OSwyNC43MSwxNy4yMUM5MC4xNSw2Mi42OSw5OCw2OC4wNiwxMDUuODMsNzMuNWExLjcyLDEuNzIsMCwwLDAsMi4zMSwwYzYuMzItNC4zMywxMi43MS04LjU5LDE5LTEyLjkycTIzLjQ4LTE2LjA5LDQ2LjkyLTMyLjIzTDIwOC4yMiw1YzIuMzYtMS42MSw0LjcxLTMuMjUsNy4xNy01aC0zNFExNTYuMzUsMTcuMTcsMTMxLjMzLDM0LjM2Wk0yMy43NywxMDUuNTRhMi41NCwyLjU0LDAsMCwwLS4xOC40NXYxNC4yNGMwLDIuODQsMCw1LjY4LDAsOC41MWExLjM1LDEuMzUsMCwwLDAsLjEyLjVsODMuOSw1OCwuMDgsMCwxNy4wNy0xMS44NFpNMTkxLjM4LDQ3LjgyLDEyOC45NCw5MWE1LjQ3LDUuNDcsMCwwLDAsLjY2Ljc0cTcuOTIsNS42MSwxNS44NSwxMS4xN2EuOTIuOTIsMCwwLDAsLjU3LjFsNDUuMjEtMzEuM2ExLjczLDEuNzMsMCwwLDAsLjE1LS40MlptLjA1LDU4LjYzYy03LjA5LDQuODktMTMuOTMsOS42Mi0yMC44NSwxNC40MWwxNi4yMiwxMS41LDQuNjMtMy4yMVoiLz48L2c+PC9zdmc+';

const initialInject = `
(() => {
  var connectRequests = [];

  window.addEventListener("message", function(event) {
    if (event.data.type == "connector_connected") {
      if (event.data.err !== undefined) {
        connectRequests.forEach(promise => promise.reject(event.data.err));
      } else {
        const isSuccess = event.data.success;
        connectRequests.forEach(promise => {
            if (promise.protocol === 'cardano') {
                if (isSuccess) {
                    promise.resolve(event.data.auth);
                } else {
                    promise.reject(new Error('user reject'));
                }
            } else {
                promise.resolve(isSuccess);
            }
        });
      }
    }
  });

  window.ergo_request_read_access = function() {
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_connect_request/ergo",
      }, location.origin);
      connectRequests.push({ resolve: resolve, reject: reject });
    });
  };

  window.ergo_check_read_access = function() {
    if (typeof ergo !== "undefined") {
      return ergo._ergo_rpc_call("ping", []);
    } else {
      return Promise.resolve(false);
    }
  };

  // RPC setup
  var cardanoRpcUid = 0;
  var cardanoRpcResolver = new Map();

  window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "cardano") {
      console.debug("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
      const rpcPromise = cardanoRpcResolver.get(event.data.uid);
      if (rpcPromise !== undefined) {
        const ret = event.data.return;
        if (ret.err !== undefined) {
          rpcPromise.reject(ret.err);
        } else {
          rpcPromise.resolve(ret.ok);
        }
      }
    }
  });
  
  function cardano_rpc_call(func, params, returnType) {
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_rpc_request",
        protocol: "cardano",
        url: location.hostname,
        uid: cardanoRpcUid,
        function: func,
        params,
        returnType: returnType || "cbor",
      }, location.origin);
      console.debug("cardanoRpcUid = " + cardanoRpcUid);
      cardanoRpcResolver.set(cardanoRpcUid, { resolve: resolve, reject: reject });
      cardanoRpcUid += 1;
    });
  }

  function cardano_request_read_access(cardanoAccessRequest) {
    const { requestIdentification, onlySilent } = (cardanoAccessRequest || {});
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_connect_request/cardano",
        requestIdentification,
        onlySilent,
      }, location.origin);
      connectRequests.push({
        protocol: 'cardano',
        resolve: (auth) => {
            const authWrapper = auth == null ? null : Object.freeze({
              walletId: auth.walletId,
              pubkey: auth.pubkey,
            });
            resolve(Object.freeze(new CardanoAPI(authWrapper, cardano_rpc_call)));
        },
        reject: reject
      });
    });
  }

  function cardano_check_read_access() {
    return cardano_rpc_call("is_enabled/cardano", []);
  }

  window.cardano = {
    ...(window.cardano||{}),
    '${WALLET_NAME}': {
      icon: '$ICON_URL$',
      enable: cardano_request_read_access,
      isEnabled: cardano_check_read_access,
      apiVersion: '${API_VERSION}',
      name: '${WALLET_NAME}',
    }
  };
})();
`.replace('$ICON_URL$', ICON_URL);

const cardanoApiInject = `
class CardanoAuth {
    constructor(auth, rpc) {
      this._auth = auth;
      this._cardano_rpc_call = rpc;
    }
    
    isEnabled() {
      return this._auth != null;
    }
    
    getWalletId() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.walletId;
    }
    
    getWalletPubkey() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.pubkey;
    }
    
    signHexPayload(payload_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_sign_hex_payload/cardano", [payload_hex_string]);
    }
    
    checkHexPayload(payload_hex_string, signature_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_check_hex_payload/cardano", [payload_hex_string, signature_hex_string]);
    }
}
class CardanoAPI {
  
    constructor(auth, rpc) {
      const self = this;
      function rpcWrapper(func, params) {
        return rpc(func, params, self._returnType[0]);
      }
      this._auth = new CardanoAuth(auth, rpcWrapper);
      this._cardano_rpc_call = rpcWrapper;
      this._disconnection = [false];
      this._returnType = ["cbor"];
      window.addEventListener('yoroi_wallet_disconnected', function() {
          if (!self._disconnection[0]) {
              self._disconnection[0] = true;
              self._disconnection.slice(1).forEach(f => f());
          }
      });
    }
    
    experimental = Object.freeze({
    
      setReturnType: (returnType) => {
        if (returnType !== 'cbor' && returnType !== 'json') {
          throw new Error('Possible return type values are: "cbor" or "json"');
        }
        this._returnType[0] = returnType;
      },
      
      auth: () => {
        return this._auth;
      },
      
      createTx: (req) => {
        return this._cardano_rpc_call("create_tx/cardano", [req]);
      },
      
      onDisconnect: (callback) => {
        if (this._disconnection[0]) {
          throw new Error('Cardano API instance is already disconnected!');
        }
        this._disconnection.push(callback);
      },
      
    }) 
    
    getNetworkId() {
      // TODO
      throw new Error('Not implemented yet');
    }
    
    getBalance(token_id = '*') {
      return this._cardano_rpc_call("get_balance", [token_id]);
    }
    
    getUsedAddresses(paginate = undefined) {
      return this._cardano_rpc_call("get_used_addresses", [paginate]);
    }
    
    getUnusedAddresses() {
      return this._cardano_rpc_call("get_unused_addresses", []);
    }
    
    getRewardAddresses() {
      return this._cardano_rpc_call("get_reward_addresses/cardano", []);
    }
    
    getChangeAddress() {
      return this._cardano_rpc_call("get_change_address", []);
    }
    
    getUtxos(amount = undefined, paginate = undefined) {
      return this._cardano_rpc_call("get_utxos/cardano", [amount, paginate]);
    }
    
    submitTx(tx) {
      return this._cardano_rpc_call('submit_tx', [tx]);
    }
    
    signTx(param, _partialSign = false) {
      if (param == null) {
        throw new Error('.signTx argument cannot be null!');
      }
      let tx = param;
      let partialSign = _partialSign;
      let returnTx = false;
      if (typeof param === 'object') {
        tx = param.tx;
        partialSign = param.partialSign;
        returnTx = param.returnTx;
      } else if (typeof param !== 'string') {
        throw new Error('.signTx argument is expected to be an object or a string!')
      }
      return this._cardano_rpc_call('sign_tx/cardano', [{ tx, partialSign, returnTx }]);
    }
    
    signData(address, payload) {
      return this._cardano_rpc_call("sign_data", [address, payload]);
    }

    // DEPRECATED
    getCollateralUtxos(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
    }

    getCollateral(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
    }
}
`

const ergoApiInject = `
// RPC set-up
var ergoRpcUid = 0;
var ergoRpcResolver = new Map();

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "ergo") {
        console.debug("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        const rpcPromise = ergoRpcResolver.get(event.data.uid);
        if (rpcPromise !== undefined) {
            const ret = event.data.return;
            if (ret.err !== undefined) {
                rpcPromise.reject(ret.err);
            } else {
                rpcPromise.resolve(ret.ok);
            }
        }
    }
});

class ErgoAPI {
    get_balance(token_id = 'ERG') {
        return this._ergo_rpc_call("get_balance", [token_id]);
    }

    get_utxos(amount = undefined, token_id = 'ERG', paginate = undefined) {
        return this._ergo_rpc_call("get_utxos", [amount, token_id, paginate]);
    }

    get_used_addresses(paginate = undefined) {
        return this._ergo_rpc_call("get_used_addresses", [paginate]);
    }

    get_unused_addresses() {
        return this._ergo_rpc_call("get_unused_addresses", []);
    }

    get_change_address() {
        return this._ergo_rpc_call("get_change_address", []);
    }

    sign_tx(tx) {
        return this._ergo_rpc_call("sign_tx", [tx]);
    }

    sign_tx_input(tx, index) {
        return this._ergo_rpc_call("sign_tx_input", [tx, index]);
    }

    // This is unsupported by current version of Yoroi
    // and the details of it are not finalized yet in the EIP-012
    // dApp bridge spec.
    // sign_data(addr, message) {
    //     return this._ergo_rpc_call("sign_data", [addr, message]);
    // }

    submit_tx(tx) {
        return this._ergo_rpc_call("submit_tx", [tx]);
    }

    _ergo_rpc_call(func, params) {
        return new Promise(function(resolve, reject) {
            window.postMessage({
                type: "connector_rpc_request",
                protocol: "ergo",
                uid: ergoRpcUid,
                function: func,
                params: params
            }, location.origin);
            console.debug("ergoRpcUid = " + ergoRpcUid);
            ergoRpcResolver.set(ergoRpcUid, { resolve: resolve, reject: reject });
            ergoRpcUid += 1;
        });
    }
}

const ergo = Object.freeze(new ErgoAPI());
`

const API_INTERNAL_ERROR = -2;
const API_REFUSED = -3;

function checkInjectionInDocument() {
    const el = document.getElementById(INJECTED_TYPE_TAG_ID);
    return el ? el.value : 'nothing';
}

function markInjectionInDocument(container) {
    const inp = document.createElement('input');
    inp.setAttribute('type', 'hidden');
    inp.setAttribute('id', INJECTED_TYPE_TAG_ID);
    inp.setAttribute('value', YOROI_TYPE);
    container.appendChild(inp);
}

function injectIntoPage(code) {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute("async", "false");
        scriptTag.textContent = code;
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);
        console.log(`[yoroi/${YOROI_TYPE}] dapp-connector is successfully injected into ${location.hostname}`);
        markInjectionInDocument(container);
        return true;
    } catch (e) {
        console.error(`[yoroi/${YOROI_TYPE}] injection failed!`, e);
        return false;
    }
}

function buildTypePrecedence(buildType) {
    switch (buildType) {
        case 'dev': return 2;
        case 'nightly': return 1;
        case 'prod': return 0;
        default: return -1;
    }
}

function shouldInject() {
    const documentElement = document.documentElement.nodeName
    const docElemCheck = documentElement ? documentElement.toLowerCase() === 'html' : true;
    const { docType } = window.document;
    const docTypeCheck = docType ? docType.name === 'html' : true;
    if (docElemCheck && docTypeCheck) {
        console.debug(`[yoroi/${YOROI_TYPE}] checking if should inject dapp-connector api`);
        const existingBuildType = checkInjectionInDocument();
        if (buildTypePrecedence(YOROI_TYPE) >= buildTypePrecedence(existingBuildType)) {
            console.debug(`[yoroi/${YOROI_TYPE}] injecting over '${existingBuildType}'`);
            return true
        }
    }
    return false;
}

/**
 * We can't get the favicon using the Chrome extension API
 * because getting the favicon for the current tab requires the "tabs" permission
 * which we don't use in the connector
 * So instead, we use this heuristic
 */
function getFavicons(url) {
    const defaultFavicon = `${url}/favicon.ico`;
    // sometimes the favicon is specified at the top of the HTML
    const optionalFavicon = document.querySelector("link[rel~='icon']");
    if(optionalFavicon) {
        return [defaultFavicon, optionalFavicon.href]
    }
    return [defaultFavicon];
}
let yoroiPort = null;
let ergoApiInjected = false;
let cardanoApiInjected = false;

function disconnectWallet(protocol) {
    yoroiPort = null;
    if (protocol === 'ergo') {
        window.dispatchEvent(new Event("ergo_wallet_disconnected"));
    } else {
        window.dispatchEvent(new Event("yoroi_wallet_disconnected"));
    }
}

function createYoroiPort() {
    const connectedProtocolHolder = [];
    // events from Yoroi
    if (extensionId === 'self') {
      // this is part of Yoroi extension
      yoroiPort = chrome.runtime.connect();    
    } else {
      // this is the seperate connector extension
      yoroiPort = chrome.runtime.connect(extensionId);
    }
    yoroiPort.onMessage.addListener(message => {
        // alert("content script message: " + JSON.stringify(message));
        if (message.type === "connector_rpc_response") {
            window.postMessage(message, location.origin);
        } else if (message.type === "yoroi_connect_response/ergo") {
            if (message.success) {
                connectedProtocolHolder[0] = 'ergo';
                if (!ergoApiInjected) {
                    // inject full API here
                    if (injectIntoPage(ergoApiInject)) {
                        ergoApiInjected = true;
                    } else {
                        console.error()
                        window.postMessage({
                            type: "connector_connected",
                            err: {
                                code: API_INTERNAL_ERROR,
                                info: "failed to inject Ergo API"
                            }
                        }, location.origin);
                    }
                }
            }
            window.postMessage({
                type: "connector_connected",
                success: message.success
            }, location.origin);
        } else if (message.type === "yoroi_connect_response/cardano") {
            if (message.success) {
                connectedProtocolHolder[0] = 'cardano';
                if (!cardanoApiInjected) {
                    // inject full API here
                    if (injectIntoPage(cardanoApiInject)) {
                        cardanoApiInjected = true;
                    } else {
                        console.error()
                        window.postMessage({
                            type: "connector_connected",
                            err: {
                                code: API_INTERNAL_ERROR,
                                info: "failed to inject Cardano API"
                            }
                        }, location.origin);
                    }
                }
            }
            window.postMessage({
                type: "connector_connected",
                success: message.success,
                auth: message.auth,
                err: message.err,
            }, location.origin);
        }
    });

    yoroiPort.onDisconnect.addListener(event => {
        disconnectWallet(connectedProtocolHolder[0]);
    });
}

function handleConnectorConnectRequest(event, protocol) {
    const requestIdentification = event.data.requestIdentification;
    if ((ergoApiInjected || (cardanoApiInjected && !requestIdentification)) && yoroiPort) {
        // we can skip communication - API injected + hasn't been disconnected
        window.postMessage({
            type: "connector_connected",
            success: true
        }, location.origin);
    } else {
        if (yoroiPort == null) {
            createYoroiPort();
        }
        // note: content scripts are subject to the same CORS policy as the website they are embedded in
        // but since we are querying the website this script is injected into, it should be fine
        convertImgToBase64(location.origin, getFavicons(location.origin))
          .then(imgBase64Url => {
              const message = {
                  imgBase64Url,
                  type: `yoroi_connect_request/${protocol}`,
                  connectParameters: {
                      url: location.hostname,
                      requestIdentification,
                      onlySilent: event.data.onlySilent,
                  },
                  protocol,
              };
              yoroiPort.postMessage(message);
          });
    }
}

function handleConnectorRpcRequest(event) {
    console.debug("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
    if (event.data.function === 'is_enabled/cardano' && yoroiPort == null) {
      createYoroiPort();
    }
    if (!yoroiPort) {
        // No active wallet connection
        window.postMessage({
            type: "connector_rpc_response",
            uid: event.data.uid,
            return: {
                err: {
                    code: API_REFUSED,
                    info: 'Wallet disconnected'
                }
            }
        }, location.origin);
        return;
    }
    try {
        yoroiPort.postMessage(event.data);
    } catch (e) {
        console.error(`Could not send RPC to Yoroi: ${e}`);
        window.postMessage({
            type: "connector_rpc_response",
            uid: event.data.uid,
            return: {
                err: {
                    code: API_INTERNAL_ERROR,
                    info: `Could not send RPC to Yoroi: ${e}`
                }
            }
        }, location.origin);
    }
}

function connectorEventListener(event) {
    const dataType = event.data.type;
    if (dataType === "connector_rpc_request") {
        handleConnectorRpcRequest(event);
    } else if (dataType === "connector_connect_request/ergo" || dataType === 'connector_connect_request/cardano') {
        const protocol = dataType.split('/')[1];
        handleConnectorConnectRequest(event, protocol);
    }
}

if (shouldInject()) {
    if (injectIntoPage(initialInject)) {
        // events from page (injected code)
        window.addEventListener("message", connectorEventListener);
    }
}

/**
 * Returns a PNG base64 encoding of the favicon
 * but returns empty string if no favicon is set for the page
 */
async function convertImgToBase64(origin, urls) {
    let response;
    for (url of urls) {
        try {
            const mode = url.includes(origin) ? 'same-origin' : 'no-cors';
            response = await fetch(url, { mode });
            break;
        } catch (e) {
            if (String(e).includes('Failed to fetch')) {
                console.warn(`[yoroi-connector] Failed to fetch favicon at '${url}'`);
                continue;
            }
            console.error(`[yoroi-connector] Failed to fetch favicon at '${url}'`, e);
            // throw e;
        }
    }
    if (!response) {
        console.warn(`[yoroi-connector] No downloadable favicon found `);
        return '';
    }
    const blob = await response.blob();

    const reader = new FileReader();
    await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
    });
    return reader.result;
}

