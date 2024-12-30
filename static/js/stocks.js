var stock_url =
        "https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/all/all_tickers.txt";
      var stock_list;
      var ticker;
      var buy = Math.random() < 0.5;

      fetch(stock_url).then(function (resp) {
        resp.text().then(function (text) {
          stock_list = text.split("\n");
          stock_list.pop();
          ticker = stock_list[Math.floor(Math.random() * stock_list.length)];
          done();
        });
      });

      function done() {
        var msg = "";
        if (buy) {
          msg = " to the moon! BUY BUY BUY";
          document.getElementById("stock_img").src =
            "static/images/wojak_stock_up.webp";
        } else {
          msg = " down the toilet! SELL SELL SELL";
          document.getElementById("stock_img").src =
            "static/images/wojak_stock_down.gif";
        }
        document.getElementById("stock_ticker").textContent = ticker;
        document.getElementById("stock_msg").textContent = msg;
      }
