const choo = require('choo');
const html = require('choo/html');
const nanotiming = require('nanotiming');
const download = require('./download');
const footer = require('../templates/footer');
const fxPromo = require('../templates/fxPromo');
const signupPromo = require('../templates/signupPromo');
const fileList = require('../templates/fileList');
const profile = require('../templates/userAccount');
const modal = require('../templates/modal');
const assets = require('../../common/assets');
const header = require('../templates/header');

nanotiming.disabled = true;

module.exports = function() {
  const app = choo();

  function banner(state, emit) {
    if (state.promo && !state.route.startsWith('/unsupported/')) {
      return fxPromo(state, emit);
    }
  }

  function modalDialog(state, emit) {
    if (state.modal) {
      return modal(state, emit);
    }
  }

  function body(template) {
    return function(state, emit) {
      const b = html`<body>
      ${modalDialog(state, emit)}
      ${banner(state, emit)}
      ${header(state)}
      <main class="main">
        <noscript>
          <div class="noscript">
            <h2>${state.translate('javascriptRequired')}</h2>
            <p>
              <a class="link" href="https://github.com/mozilla/send/blob/master/docs/faq.md#why-does-firefox-send-require-javascript">
              ${state.translate('whyJavascript')}
              </a>
            </p>
            <p>${state.translate('enableJavascript')}</p>
          </div>
        </noscript>
        <div class="main__file-manager">
          ${profile(state, emit)}
          ${template(state, emit)}
        </div>
        <div class="main__context">
          <div class="main__signup-promo">
            ${signupPromo(state)}
          </div>
          <div class="main__file-list">
            ${fileList(state)}
          </div>
          <div class="main__context-footer">
            <a
              href="https://www.mozilla.org"
              class="socialSection__link">
              <img
                class="footer__mozLogo"
                src="${assets.get('mozilla-logo.svg')}"
                alt="mozilla"/>
            </a>
          </div>
        </div>
      </main>
      ${footer(state)}
    </body>`;
      if (state.layout) {
        // server side only
        return state.layout(state, b);
      }
      return b;
    };
  }

  app.route('/', body(require('../pages/welcome')));
  app.route('/share/:id', body(require('../pages/share')));
  app.route('/download/:id', body(download));
  app.route('/download/:id/:key', body(download));
  app.route('/unsupported/:reason', body(require('../pages/unsupported')));
  app.route('/legal', body(require('../pages/legal')));
  app.route('/error', body(require('../pages/error')));
  app.route('/blank', body(require('../pages/blank')));
  app.route('/signin', body(require('../pages/signin')));
  app.route('/oauth', async function(state, emit) {
    try {
      await state.user.finishLogin(state.query.code, state.query.state);
      emit('replaceState', '/');
    } catch (e) {
      emit('replaceState', '/error');
      setTimeout(() => emit('render'));
    }
  });
  app.route('*', body(require('../pages/notFound')));
  return app;
};
