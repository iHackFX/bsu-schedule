const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  devServer: {
    allowedHosts: "all",
    client: {
      webSocketURL: "auto://0.0.0.0:0/ws",
    },
    proxy: {
      "^/bsu": { target: "http://echo.uz" },
    },
  },

  pwa: {
    name: "Расписание",
    themeColor: null,
    msTileColor: "#ffffff",
    manifestOptions: {
      background_color: "#ffffff",
      theme_color: "#f5f5f5",

      start_url: "https://ef49-46-172-22-12.eu.ngrok.io",
      scope: "https://ef49-46-172-22-12.eu.ngrok.io",
    },
  },
  configureWebpack: {
    optimization: {
      minimize: false,
    },
  },

  // publicPath: process.env.NODE_ENV === "production" ? "/test-build/" : "/",
});
