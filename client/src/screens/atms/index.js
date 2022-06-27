import './atms.scss';
import { getData } from '../../helpers';

export const atms = (el) => {
  return el('section', { class: 'atms container' }, [
    el('h2', { class: 'title' }, 'Карта банкоматов'),
    el('div', { id: 'map', class: 'atms__map' }),
  ]);
};

export const addMap = async () => {
  const data = await getData('banks');
  async function script(url) {
    if (Array.isArray(url)) {
      let self = this;
      let prom = [];
      url.forEach(function (item) {
        prom.push(self.script(item));
      });
      return Promise.all(prom);
    }

    return new Promise(function (resolve, reject) {
      let r = false;
      let t = document.getElementsByTagName('script')[0];
      let s = document.createElement('script');

      s.type = 'text/javascript';
      s.src = url;
      s.async = true;
      s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
          r = true;
          resolve(this);
        }
      };
      s.onerror = s.onabort = reject;
      t.parentNode.insertBefore(s, t);
    });
  }

  /* eslint-disable */
  await script('https://api-maps.yandex.ru/2.1/?apikey=30c606be-6c96-48b4-a6a2-80eab6220ea3&lang=ru_RU');
  let atmsMap;
  function init() {
    atmsMap = new ymaps.Map("map", {
      center: [55.76, 37.64],
      zoom: 11
    });
    data.forEach(atm => {
      const placemark = new ymaps.Placemark([atm.lat, atm.lon]);
      atmsMap.geoObjects.add(placemark);
    });
  }
  await ymaps.ready(init);
  return atmsMap;
}
