      let owoified = false, clicked = 0;
      const faces = [
          '(o´∀`o)',
          '(#｀ε´)',
          '(๑•̀ㅁ•́๑)✧',
          '(*≧m≦*)',
          '(・`ω´・)',
          'UwU',
          'OwO',
          '>w<',
          '｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡',
          'ヾ(｀ε´)ﾉ',
          '(´• ω •`)',
          'o(>ω<)o',
          '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
          '(⁀ᗢ⁀)',
          '(￣ε￣＠)',
          '( 〃▽〃)',
          '(o^ ^o)',
          "ヾ(*'▽'*)"
      ];

      function owoify() {
        traverse(document.body, owoified);
        owoified = !owoified; 
      }

      function transform(str) {
          let out = '';
          let level = 0;
          const chars = str.split('');
          for (let i = 0; i < chars.length; i++) {
              switch (chars[i]) {
                  default: {
                      if (level == 0) {
                          out += chars[i].replace(/[rl]/g, 'w').replace(/[RL]/g, 'W');
                      } else {
                          out += chars[i];
                      }
                      break;
                  }
              }
              if (i === chars.length - 1) {
                  if (Math.floor(Math.random() * 100) < 50) {
                      const face = faces[Math.floor(Math.random() * faces.length)];
                      out += ' ' + face;
                  }
              }
          }
          return out;
      }

      function traverse(node, undo) {
          var child, next;
      
          switch (node.nodeType) {
              case 1:
              case 9:
              case 11:
                  child = node.firstChild;
                  while (child) {
                      next = child.nextSibling;
                      traverse(child, undo);
                      child = next;
                  }
                  break;
              case 3:
                  if (undo) {
                      if (node.originalValue !== undefined) {
                          node.nodeValue = node.originalValue;
                      }
                  } else {
                      node.originalValue = node.nodeValue;
                      if (typeof node.nodeValue === 'string' && node.nodeValue.trim() != "" && node.nodeValue.trim().length != 1 && !parseInt(node.nodeValue.trim())) {
                          node.nodeValue = transform(clicked >= 69 ? node.nodeValue.toUpperCase() : node.nodeValue);
                      }
                  }
                  break;
          }
      }
